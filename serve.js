// Zero-dependency local test server.
// Run with:  node serve.js
// Then open: http://localhost:8000
//
// This exists only so the Video Bench (which needs COOP/COEP headers) works
// during local testing. Plain `python3 -m http.server` will NOT set these
// headers, so video tools will show the isolation error on that server.

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const ROOT = __dirname;

const MIME = {
  '.html':'text/html', '.js':'text/javascript', '.css':'text/css',
  '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.json':'application/json'
};

http.createServer((req, res) => {
  let filePath = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (filePath.endsWith('/')) filePath = path.join(filePath, 'index.html');

  fs.readFile(filePath, (err, data) => {
    if (err){
      res.writeHead(404); res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Serving on http://localhost:${PORT}  (Ctrl+C to stop)`));
