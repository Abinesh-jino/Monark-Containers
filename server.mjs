import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2'
};

// Local development server. Only public website files are served.
http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end('Method not allowed');
  }
  try {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const relative = urlPath === '/' ? 'index.html' : urlPath.slice(1);
    const allowed = (/^[a-z0-9-]+\.html$/i.test(relative) || ['styles.css', 'app.js', 'favicon.svg'].includes(relative))
      || /^assets\/[a-z0-9.-]+$/i.test(relative);
    if (!allowed) { res.writeHead(404); return res.end('Not found'); }
    const target = path.resolve(root, relative);
    if (!target.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
    const data = fs.readFileSync(target);
    res.writeHead(200, {
      'Content-Type': mime[path.extname(target)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '127.0.0.1', () => {
  console.log(`Monark preview: http://127.0.0.1:${port}`);
});

