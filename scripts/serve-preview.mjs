import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { root } from './lib/resources.mjs';

const previewRoot = path.join(root, '.preview');
const port = Number(process.env.PORT || 4173);
const contentTypes = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg' };

http.createServer((request, response) => {
  const urlPath = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  let relative = urlPath === '/' ? 'resources/index.html' : urlPath.replace(/^\//, '');
  let filePath = path.resolve(previewRoot, relative);
  if (!filePath.startsWith(previewRoot + path.sep)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  if (!fs.existsSync(filePath)) filePath = path.resolve(root, relative);
  if (!filePath.startsWith(root + path.sep) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404).end('Not found');
    return;
  }
  response.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(response);
}).listen(port, '127.0.0.1', () => {
  console.log(`Draft preview: http://127.0.0.1:${port}/resources/how-to-plan-home-renovation.html`);
});
