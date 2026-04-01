/**
 * draw2agent — Scratch Whiteboard Server
 * Lightweight HTTP server serving a standalone Excalidraw whiteboard.
 * No proxy — just a blank canvas for freehand sketching.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setState, rejectState, type DrawingState } from './state-store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OVERLAY_DIR = path.resolve(__dirname, '..', 'overlay', 'dist');
const D2A_PREFIX = '/__d2a__';

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

let scratchServer: http.Server | null = null;

/**
 * Generates the standalone whiteboard HTML page.
 * Loads the same Excalidraw overlay but in "scratch" mode (full-page whiteboard).
 */
function getScratchHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>draw2agent — Scratch Whiteboard</title>
  <link rel="stylesheet" href="${D2A_PREFIX}/draw2agent-overlay.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #1e1e2e; }
    /* In scratch mode, make the Excalidraw canvas fill the entire page with a visible background */
    #draw2agent-root {
      position: fixed !important;
      inset: 0 !important;
      z-index: 1 !important;
    }
    #draw2agent-root .d2a-canvas-container {
      pointer-events: all !important;
      position: fixed !important;
      inset: 0 !important;
      z-index: 1 !important;
    }
    /* Show a background for the Excalidraw canvas in scratch mode */
    #draw2agent-root .excalidraw {
      --ui-font: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    /* Override transparent background for scratch mode */
    #draw2agent-root .excalidraw .excalidraw__canvas {
      background: #1e1e2e !important;
    }
  </style>
</head>
<body data-d2a-mode="scratch">
  <script src="${D2A_PREFIX}/draw2agent-overlay.js"></script>
</body>
</html>`;
}

export function startScratchServer(port: number): Promise<string> {
  return new Promise((resolve, reject) => {
    if (scratchServer) {
      resolve(`http://localhost:${port}`);
      return;
    }

    scratchServer = http.createServer((req, res) => {
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
            payload.targetUrl = 'scratch://whiteboard';
            setState(payload);

            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            });
            res.end(JSON.stringify({ success: true }));
            console.error('[draw2agent] ✅ Scratch state captured successfully');
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error('[draw2agent] ❌ Scratch capture error:', msg);
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
        console.error('[draw2agent] 🛑 Scratch session closed by user');
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

      // Serve the scratch whiteboard HTML for root
      if (url === '/' || url === '/index.html') {
        const html = getScratchHTML();
        res.writeHead(200, {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache',
        });
        res.end(html);
        return;
      }

      // 404 for everything else
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    });

    scratchServer.listen(port, '127.0.0.1', () => {
      const url = `http://127.0.0.1:${port}`;
      console.error(`[draw2agent] 🎨 Scratch whiteboard at ${url}`);
      resolve(url);
    });

    scratchServer.on('error', (err) => {
      reject(err);
    });
  });
}

export function stopScratchServer(): void {
  if (scratchServer) {
    scratchServer.closeAllConnections();
    scratchServer.close();
    scratchServer = null;
  }
}
