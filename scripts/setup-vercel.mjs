// Post-build script: wires up the Vercel serverless function that
// tanstackStart({ target: "vercel" }) builds but doesn't register.
import { mkdirSync, cpSync, writeFileSync, existsSync, readFileSync } from 'node:fs';

const vercelOut = '.vercel/output';
const funcDir = `${vercelOut}/functions/render.func`;

if (existsSync(funcDir)) {
  console.log('Vercel function already configured by adapter — skipping.');
  process.exit(0);
}

console.log('Configuring Vercel SSR function output...');

mkdirSync(`${vercelOut}/static`, { recursive: true });
mkdirSync(funcDir, { recursive: true });

// Static assets: dist/client → .vercel/output/static
cpSync('dist/client', `${vercelOut}/static`, { recursive: true });

// Server bundle: dist/server → .vercel/output/functions/render.func
cpSync('dist/server', funcDir, { recursive: true });

// Vercel requires the entry point to be named index.js
writeFileSync(`${funcDir}/index.js`, readFileSync(`${funcDir}/server.js`));

// Edge runtime config — TanStack Start's Vercel adapter exports a fetch handler
writeFileSync(`${funcDir}/.vc-config.json`, JSON.stringify({
  runtime: 'edge',
  entrypoint: 'index.js',
}));

// Routing: serve static files first, then fall through to the SSR function
writeFileSync(`${vercelOut}/config.json`, JSON.stringify({
  version: 3,
  routes: [
    { handle: 'filesystem' },
    { src: '/(.*)$', dest: '/render' },
  ],
}));

console.log('Done — Vercel SSR function configured.');
