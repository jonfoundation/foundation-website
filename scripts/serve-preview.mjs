import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { root } from './lib/resources.mjs';

const previewRoot = path.join(root, '.preview');
const port = Number(process.env.PORT || 4173);
const contentTypes = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };

function resolveRequest(base, relative) {
  const candidates = [relative];
  if (!path.extname(relative)) candidates.push(`${relative}.html`);
  for (const candidate of candidates) {
    const filePath = path.resolve(base, candidate);
    if (!filePath.startsWith(base + path.sep)) return null;
    if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) return filePath;
  }
  return null;
}

http.createServer((request, response) => {
  const urlPath = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  let relative = urlPath === '/' ? 'resources/index.html' : urlPath.replace(/^\//, '');
  if (urlPath !== '/' && urlPath.endsWith('/')) relative = path.join(relative, 'index.html');
  let filePath = resolveRequest(previewRoot, relative);
  if (!filePath && !path.resolve(previewRoot, relative).startsWith(previewRoot + path.sep)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  if (!filePath) filePath = resolveRequest(root, relative);
  if (!filePath) {
    response.writeHead(404).end('Not found');
    return;
  }
  response.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(response);
}).listen(port, '127.0.0.1', () => {
  console.log(`Draft preview: http://127.0.0.1:${port}/resources/how-to-plan-home-renovation`);
});
