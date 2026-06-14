---
name: project-vercel-deployment
description: How Vercel deployment works for this TanStack Start app — non-obvious workaround for adapter bug
metadata:
  type: project
---

`tanstackStart({ target: "vercel" })` has a bug in v1.167.x: it builds the SSR bundle but never writes to `.vercel/output/functions/`, so Vercel deploys only static files and 404s on every route.

**Workaround in place:**
- `scripts/setup-vercel.mjs` — post-build script that manually creates the Vercel function output
- `package.json` build: `vite build && node scripts/setup-vercel.mjs`
- `vite.config.ts` has `ssr: { noExternal: true }` — bundles all dependencies into the SSR output (required because the Vercel function has no access to node_modules)

**Why Node.js runtime (not Edge):**
`bcryptjs` and `@neondatabase/serverless` use `crypto`/`node:stream` which aren't available in Edge. Using `nodejs20.x` runtime.

**Handler adapter:**
TanStack Start exports a Web API `fetch(Request) → Response` handler. Vercel Node.js runtime expects `(req, res)`. The script writes a thin adapter `index.js` that bridges the two. Also writes `package.json` with `"type": "module"` so Node.js treats the function as ESM. The adapter must forward `Set-Cookie` via `headers.getSetCookie()` (the Fetch spec hides it from `headers.entries()`) or sessions silently break.

**`@vitejs/plugin-react` (viteReact) is REQUIRED in vite.config.ts — do not remove it.**
It provides the automatic JSX runtime. Without it the build uses the classic transform expecting a global `React`, and the client bundle crashes on load with "React is not defined" before hydrating. Symptom is subtle: pages render (SSR HTML) but are dead — forms do native submits, nothing interactive works, and auth appears broken (login "succeeds" but bounces, because the empty SSR-set session cookie is the only one that ever exists). Always keep viteReact AFTER tanstackStart in the plugins array.

**Why:** The `tanstackStart` Vercel adapter bug + Node.js built-in dependency conflict.
