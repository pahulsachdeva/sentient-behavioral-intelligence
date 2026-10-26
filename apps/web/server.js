import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };
const port = Number(process.env.PORT || 4173);
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const target = resolve(root, '.' + (pathname === '/' ? '/apps/web/index.html' : pathname));
    if (!target.startsWith(root + sep) || !(await stat(target)).isFile()) throw new Error('Not found');
    response.writeHead(200, { 'content-type': types[extname(target)] || 'application/octet-stream', 'x-content-type-options': 'nosniff' });
    response.end(await readFile(target));
  } catch { response.writeHead(404); response.end('Not found'); }
}).listen(port, () => console.log(`SENTIENT demo: http://localhost:${port}`));
