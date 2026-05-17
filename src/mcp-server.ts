/**
 * draw2agent — MCP Server with tool registration
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { startHttpServer, stopHttpServer, setQrPage } from './http-server.js';
import { startScratchServer, stopScratchServer } from './scratch-server.js';
import { generateQR } from './utils/qrcode.js';
import { getState, clearState, setProxyInfo, clearProxyInfo, getProxyInfo, waitForState } from './state-store.js';
import { openBrowser } from './utils/browser.js';
import { getLanIp } from './utils/network.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INSTRUCTIONS_PATH = path.resolve(__dirname, '..', 'prompts', 'agent-instructions.txt');
const ERROR_INSTRUCTIONS_PATH = path.resolve(__dirname, '..', 'prompts', 'agent-error-instructions.txt');
const CLOSE_INSTRUCTIONS_PATH = path.resolve(__dirname, '..', 'prompts', 'agent-close-instructions.txt');
const IPAD_INSTRUCTIONS_PATH = path.resolve(__dirname, '..', 'prompts', 'agent-ipad-instructions.txt');
const SCRATCH_INSTRUCTIONS_PATH = path.resolve(__dirname, '..', 'prompts', 'agent-scratch-instructions.txt');

const DEFAULT_PORT = 9742;
const DEFAULT_SCRATCH_PORT = 9743;

/** Read a prompt file safely, returning a fallback string on failure. */
function readPromptFile(filePath: string, fallback: string): string {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
  } catch (e) {
    console.error(`[draw2agent] Failed to read ${path.basename(filePath)}, using default.`, e);
  }
  return fallback;
}

/** Handle errors from canvas/scratch tools with proper close/error instructions. */
function handleToolError(err: unknown, toolName: string) {
  const message = err instanceof Error ? err.message : String(err);
  let customInstructions = `❌ Failed to capture canvas: ${message}`;
  let isErrorResult = true;

  if (message.includes('User closed the draw2agent session')) {
    customInstructions = readPromptFile(
      CLOSE_INSTRUCTIONS_PATH,
      'The user closed the draw2agent session. Please summarize the changes you made.'
    );
    // Replace tool name in close instructions so it doesn't tell the agent to re-call the wrong tool
    customInstructions = customInstructions.replace(/launch_canvas/g, toolName);
    isErrorResult = false;

    customInstructions = readPromptFile(ERROR_INSTRUCTIONS_PATH, customInstructions)
      .replace('{{ERROR_MESSAGE}}', message);
  }

  return {
    content: [{ type: 'text' as const, text: customInstructions }],
    isError: isErrorResult,
  };
}

/** Builds the QR landing page shown on the user's computer for scanning. */
function buildQrPageHtml(qrDataUrl: string, ipadUrl: string, proxyPort: number): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>draw2agent — Scan to Draw</title></head><body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#1e1e2e;color:white;font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:24px;box-sizing:border-box;"><h1 style="margin:0 0 8px;">📱 Scan to Draw</h1><p style="margin:0 0 24px;opacity:0.8;max-width:420px;">Scan this QR code with your iPad's camera to start annotating. Your iPad must be on the <strong>same Wi-Fi network</strong> as this computer.</p><img src="${qrDataUrl}" alt="QR code" style="border-radius:12px;width:300px;height:300px;background:#fff;"/><p style="margin:24px 0 0;font-size:1.1rem;background:#ffffff10;padding:8px 16px;border-radius:8px;">${ipadUrl}</p><p style="margin:16px 0 0;opacity:0.5;font-size:0.85rem;max-width:420px;">If your iPad can't connect, make sure this computer's firewall allows incoming connections on port ${proxyPort}.</p></body></html>`;
}

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: 'draw2agent',
    version: '0.1.0',
  });

  // ─── Tool: launch_canvas ─────────────────────────────────────────────
  server.tool(
    'launch_canvas',
    'Launch a browser canvas overlay on top of the user\'s local development page. The user can draw annotations (circles, arrows, text) directly on their website, then submit to capture a screenshot and DOM context for the agent. This tool will block and wait until the user has submitted their drawings, returning the full visual context.',
    {
      targetUrl: z.string().describe('The URL of the local dev server to overlay (e.g. http://localhost:3000)'),
      port: z.number().optional().describe('Port for the draw2agent proxy server (default: 9742)'),
    },
    async ({ targetUrl, port }) => {
      const proxyPort = port ?? DEFAULT_PORT;

      try {
        // Pre-flight check: ensure the target dev server is actually running
        try {
          const checkUrl = targetUrl.replace('://localhost', '://127.0.0.1');
          await fetch(checkUrl);
        } catch (err: any) {
          if (err.cause?.code === 'ECONNREFUSED') {
            return {
              content: [
                {
                  type: 'text' as const,
                  text: `❌ Connection refused to ${targetUrl}. There is no dev server running on that port. Please ask the user to confirm the correct local server URL (e.g. localhost:3000, localhost:5173).`,
                },
              ],
              isError: true,
            };
          }
        }

        const proxyInfo = getProxyInfo();
        if (!proxyInfo.running) {
          const proxyUrl = await startHttpServer(targetUrl, proxyPort);
          setProxyInfo(proxyUrl);

          // Open browser only on initial launch
          await openBrowser(proxyUrl);
        }

        clearState();

        // Wait for the user to submit their drawing
        const state = await waitForState();

        const customInstructions = readPromptFile(
          INSTRUCTIONS_PATH,
          'Analyze the attached screenshot with user annotations and implement the requested UI changes in the codebase.'
        );

        return {
          content: [
            {
              type: 'text' as const,
              text: customInstructions,
            },
            {
              type: 'image' as const,
              data: state.annotatedScreenshot.replace(/^data:image\/\w+;base64,/, ''),
              mimeType: 'image/png' as const,
            },
          ],
        };
      } catch (err) {
        return handleToolError(err, 'launch_canvas');
      }
    }
  );

  // ─── Tool: launch_ipad_canvas ────────────────────────────────────────
  server.tool(
    'launch_ipad_canvas',
    'Launch a drawing canvas accessible from an iPad or mobile device on the same Wi-Fi network. Serves the local dev page on this machine\'s LAN address and opens a QR code in the browser that the user scans from their iPad. The user draws annotations on their device, and this tool blocks until they submit, returning the visual context. Ideal for touch-based annotation workflows.',
    {
      targetUrl: z.string().describe('The URL of the local dev server to overlay (e.g. http://localhost:3000)'),
      port: z.number().optional().describe('Port for the draw2agent proxy server (default: 9742)'),
    },
    async ({ targetUrl, port }) => {
      const proxyPort = port ?? DEFAULT_PORT;

      try {
        // Pre-flight check
        try {
          const checkUrl = targetUrl.replace('://localhost', '://127.0.0.1');
          await fetch(checkUrl);
        } catch (err: any) {
          if (err.cause?.code === 'ECONNREFUSED') {
            return {
              content: [
                {
                  type: 'text' as const,
                  text: `❌ Connection refused to ${targetUrl}. There is no dev server running on that port. Please ask the user to confirm the correct local server URL.`,
                },
              ],
              isError: true,
            };
          }
        }

        // Resolve the machine's LAN IP so an iPad on the same Wi-Fi can
        // connect directly — far more reliable than an internet tunnel.
        const lanIp = getLanIp();
        if (!lanIp) {
          return {
            content: [
              {
                type: 'text' as const,
                text: '❌ Could not determine this machine\'s local network (LAN) IP address. The iPad canvas needs a Wi-Fi/Ethernet connection so your iPad can reach this computer. Please connect to a network and try again.',
              },
            ],
            isError: true,
          };
        }

        // Start the proxy server (bound to 0.0.0.0, reachable over the LAN)
        const proxyInfo = getProxyInfo();
        if (!proxyInfo.running) {
          const proxyUrl = await startHttpServer(targetUrl, proxyPort);
          setProxyInfo(proxyUrl);
        }

        // The URL the iPad will open — the LAN address of this machine.
        const ipadUrl = `http://${lanIp}:${proxyPort}`;

        // Generate QR code for the LAN URL
        const qr = await generateQR(ipadUrl);

        // Serve the QR landing page from the proxy itself and open it over
        // HTTP. Opening an http:// URL is reliable on every platform, unlike
        // a file:// URL to a temp file (which fails to open on Windows).
        setQrPage(buildQrPageHtml(qr.dataUrl, ipadUrl, proxyPort));
        await openBrowser(`http://127.0.0.1:${proxyPort}/__d2a__/qr`);

        clearState();

        // Wait for the user to submit their drawing from the iPad
        const state = await waitForState();

        const customInstructions = readPromptFile(
          IPAD_INSTRUCTIONS_PATH,
          'Analyze the attached screenshot with user annotations and implement the requested UI changes in the codebase.'
        );

        return {
          content: [
            {
              type: 'text' as const,
              text: customInstructions,
            },
            {
              type: 'image' as const,
              data: state.annotatedScreenshot.replace(/^data:image\/\w+;base64,/, ''),
              mimeType: 'image/png' as const,
            },
          ],
        };
      } catch (err) {
        return handleToolError(err, 'launch_ipad_canvas');
      }
    }
  );

  // ─── Tool: launch_scratch ────────────────────────────────────────────
  server.tool(
    'launch_scratch',
    'Open a standalone whiteboard for freehand drawing and sketching. No target URL needed — the user gets a blank Excalidraw canvas to sketch UI mockups, wireframes, or diagrams. The agent receives the drawing as visual context. This tool blocks until the user submits their sketch.',
    {
      port: z.number().optional().describe('Port for the scratch whiteboard server (default: 9743)'),
    },
    async ({ port }) => {
      const scratchPort = port ?? DEFAULT_SCRATCH_PORT;

      try {
        const scratchUrl = await startScratchServer(scratchPort);

        // Open browser
        await openBrowser(scratchUrl);

        clearState();

        // Wait for the user to submit their sketch
        const state = await waitForState();

        const customInstructions = readPromptFile(
          SCRATCH_INSTRUCTIONS_PATH,
          'The user has drawn a freehand sketch. Analyze it and implement the design.'
        );

        return {
          content: [
            {
              type: 'text' as const,
              text: customInstructions,
            },
            {
              type: 'image' as const,
              data: state.annotatedScreenshot.replace(/^data:image\/\w+;base64,/, ''),
              mimeType: 'image/png' as const,
            },
          ],
        };
      } catch (err) {
        return handleToolError(err, 'launch_scratch');
      }
    }
  );
  // ─── Tool: get_drawing_state ──────────────────────────────────────────
  server.tool(
    'get_drawing_state',
    'Returns the current drawing state including screenshot, DOM nodes, and annotations. Use this to retrieve the latest captured state without launching a new canvas session. Returns an error if no state has been captured yet.',
    {},
    async () => {
      const state = getState();

      if (!state) {
        return {
          content: [
            {
              type: 'text' as const,
              text: '❌ No drawing state available. The user has not submitted any drawings yet. Use `launch_canvas`, `launch_ipad_canvas`, or `launch_scratch` first.',
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              timestamp: state.timestamp,
              targetUrl: state.targetUrl,
              viewportSize: state.viewportSize,
              drawingBounds: state.drawingBounds,
              domNodes: state.domNodes,
              annotationCount: state.annotations.length,
            }, null, 2),
          },
          {
            type: 'image' as const,
            data: state.annotatedScreenshot.replace(/^data:image\/\w+;base64,/, ''),
            mimeType: 'image/png' as const,
          },
        ],
      };
    }
  );

  return server;
}
