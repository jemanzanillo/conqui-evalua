// Post-build script: wires up the Vercel serverless function that
// tanstackStart({ target: "vercel" }) builds but doesn't register.
import { mkdirSync, cpSync, writeFileSync, existsSync } from 'node:fs';

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

// TanStack Start exports a Web API fetch handler, but Vercel's Node.js runtime
// expects (req, res). This adapter bridges the two.
writeFileSync(`${funcDir}/index.js`, `
import serverHandler from './server.js';

function resolveFetch(mod) {
  if (typeof mod === 'function') return mod;
  if (mod?.default && typeof mod.default === 'function') return mod.default;
  if (typeof mod?.fetch === 'function') return (r) => mod.fetch(r);
  if (typeof mod?.default?.fetch === 'function') return (r) => mod.default.fetch(r);
  throw new Error('Cannot resolve fetch handler from server module');
}

const fetchHandler = resolveFetch(serverHandler);

export default async function handler(req, res) {
  const proto = req.headers['x-forwarded-proto'] ?? 'https';
  const host = req.headers['x-forwarded-host'] ?? req.headers.host ?? 'localhost';
  const url = \`\${proto}://\${host}\${req.url ?? '/'}\`;

  const bodyChunks = [];
  for await (const chunk of req) bodyChunks.push(chunk);
  const body = Buffer.concat(bodyChunks);

  const webReq = new Request(url, {
    method: req.method ?? 'GET',
    headers: Object.fromEntries(
      Object.entries(req.headers)
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : String(v)])
    ),
    body: ['GET', 'HEAD'].includes((req.method ?? 'GET').toUpperCase())
      ? null
      : body.length > 0 ? body : null,
  });

  const webRes = await fetchHandler(webReq);

  res.statusCode = webRes.status;

  // headers.entries() hides set-cookie per the Fetch API spec.
  // Forward all other headers normally, then handle cookies explicitly.
  for (const [k, v] of webRes.headers.entries()) {
    if (k.toLowerCase() !== 'set-cookie') res.setHeader(k, v);
  }
  if (typeof webRes.headers.getSetCookie === 'function') {
    const cookies = webRes.headers.getSetCookie();
    if (cookies.length > 0) res.setHeader('set-cookie', cookies);
  }

  if (webRes.body) {
    const reader = webRes.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
  }
  res.end();
}
`);

// ESM package.json so Node.js treats .js files as ES modules
writeFileSync(`${funcDir}/package.json`, JSON.stringify({ type: 'module' }));

// Node.js 20 runtime — needed for crypto/stream built-ins used by bcryptjs and Neon
writeFileSync(`${funcDir}/.vc-config.json`, JSON.stringify({
  runtime: 'nodejs20.x',
  handler: 'index.js',
  launcherType: 'Nodejs',
  shouldAddHelpers: true,
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
