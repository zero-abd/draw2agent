/**
 * draw2agent — HTTP Server
 * Reverse proxy with overlay injection and capture endpoint.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import httpProxy from 'http-proxy';
import { setState, rejectState, type DrawingState } from './state-store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OVERLAY_DIR = path.resolve(__dirname, '..', 'overlay', 'dist');
const D2A_PREFIX = '/__d2a__';

const INJECTION_TAGS = `<link rel="stylesheet" href="${D2A_PREFIX}/draw2agent-overlay.css">\n<script src="${D2A_PREFIX}/draw2agent-overlay.js"></script>`;

const MIME_TYPES: Record<string, string> = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

let server: http.Server | null = null;

export function startHttpServer(targetUrl: string, port: number): Promise<string> {
  return new Promise((resolve, reject) => {
    if (server) {
      resolve(`http://localhost:${port}`);
      return;
    }

    // Node 18+ resolves 'localhost' to IPv6 '::1' by default, which breaks 
    // when hitting local dev servers listening only on IPv4 '127.0.0.1'.
    const safeTargetUrl = targetUrl.replace('://localhost', '://127.0.0.1');

    const proxy = httpProxy.createProxyServer({
      target: safeTargetUrl,
      changeOrigin: true,
      selfHandleResponse: true,
      ws: true,
    });

    proxy.on('proxyRes', (proxyRes, req, res) => {
      const contentType = proxyRes.headers['content-type'] || '';
      const isHtml = contentType.includes('text/html');

      // Collect response body
      const chunks: Buffer[] = [];
      proxyRes.on('data', (chunk: Buffer) => chunks.push(chunk));
      proxyRes.on('end', () => {
        let body = Buffer.concat(chunks);

        // Copy headers, but remove content-length (we may modify the body)
        const headers = { ...proxyRes.headers };
        delete headers['content-length'];
        // Remove content-encoding to avoid issues with compressed responses
        delete headers['content-encoding'];

        if (isHtml) {
          let html = body.toString('utf-8');
          // Inject overlay script before </body> or at end
          if (html.includes('</body>')) {
            html = html.replace('</body>', `${INJECTION_TAGS}\n</body>`);
          } else {
            html += INJECTION_TAGS;
          }
          body = Buffer.from(html, 'utf-8');
        }

        res.writeHead(proxyRes.statusCode || 200, headers);
        res.end(body);
      });
    });

    proxy.on('error', (err, _req, res) => {
      console.error('[draw2agent] Proxy error:', err.message);
      rejectState(`Proxy connection failed: ${err.message}`);
      
      if (res && 'writeHead' in res) {
        (res as http.ServerResponse).writeHead(502, { 'Content-Type': 'text/plain' });
        (res as http.ServerResponse).end('draw2agent proxy error: ' + err.message);
      }
    });

    server = http.createServer((req, res) => {
      const url = req.url || '/';

      // Handle CORS preflight
      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        });
        res.end();
        return;
      }

      // Capture endpoint
      if (url === `${D2A_PREFIX}/capture` && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          try {
            const payload = JSON.parse(body) as DrawingState;
            payload.timestamp = new Date().toISOString();
            payload.targetUrl = targetUrl;
            setState(payload);

            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            });
            res.end(JSON.stringify({ success: true }));
            console.error('[draw2agent] ✅ State captured successfully');
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error('[draw2agent] ❌ Capture payload error:', msg);
            rejectState(`Failed to parse capture payload: ${msg}`);

            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
          }
        });
        return;
      }

      // Close endpoint
      if (url === `${D2A_PREFIX}/close` && req.method === 'POST') {
        rejectState('User closed the draw2agent session.');
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(JSON.stringify({ success: true }));
        console.error('[draw2agent] 🛑 Session closed by user');
        return;
      }

      // Serve overlay static files
      if (url.startsWith(D2A_PREFIX + '/')) {
        const filePath = path.join(OVERLAY_DIR, url.slice(D2A_PREFIX.length));
        const ext = path.extname(filePath);
        const mime = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not found');
            return;
          }
          res.writeHead(200, {
            'Content-Type': mime,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache',
          });
          res.end(data);
        });
        return;
      }

      // Prevent the target server from compressing the response
      // so we can intercept and modify the plain HTML body.
      delete req.headers['accept-encoding'];

      // Proxy everything else
      proxy.web(req, res);
    });

    // Handle WebSocket upgrades for HMR (Vite/Next.js hot reload)
    server.on('upgrade', (req, socket, head) => {
      proxy.ws(req, socket, head);
    });

    server.listen(port, () => {
      const proxyUrl = `http://localhost:${port}`;
      console.error(`[draw2agent] 🚀 Proxy running at ${proxyUrl} → ${targetUrl}`);
      resolve(proxyUrl);
    });

    server.on('error', (err) => {
      reject(err);
    });
  });
}

export function stopHttpServer(): void {
  if (server) {
    server.close();
    server = null;
  }
}
