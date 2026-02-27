/**
 * draw2agent — MCP Server with tool registration
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { startHttpServer, stopHttpServer } from './http-server.js';
import { getState, clearState, setProxyInfo, getProxyInfo, waitForState } from './state-store.js';
import { openBrowser } from './utils/browser.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INSTRUCTIONS_PATH = path.resolve(__dirname, '..', 'prompts', 'agent-instructions.txt');
const ERROR_INSTRUCTIONS_PATH = path.resolve(__dirname, '..', 'prompts', 'agent-error-instructions.txt');
const CLOSE_INSTRUCTIONS_PATH = path.resolve(__dirname, '..', 'prompts', 'agent-close-instructions.txt');

const DEFAULT_PORT = 9742;

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: 'draw2agent',
    version: '0.1.0',
  });

  // Tool: launch_canvas
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

        let instructionsUrl = '';
        let customInstructions = 'Analyze the attached screenshot with user annotations and implement the requested UI changes in the codebase.';
        
        try {
          if (fs.existsSync(INSTRUCTIONS_PATH)) {
            customInstructions = fs.readFileSync(INSTRUCTIONS_PATH, 'utf-8');
          }
        } catch (e) {
          console.error('[draw2agent] Failed to read agent-instructions.txt, using default.', e);
        }

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
        const message = err instanceof Error ? err.message : String(err);
        let customInstructions = `❌ Failed to capture canvas: ${message}`;
        let isErrorResult = true;

        try {
          if (message.includes('User closed the draw2agent session')) {
            if (fs.existsSync(CLOSE_INSTRUCTIONS_PATH)) {
              customInstructions = fs.readFileSync(CLOSE_INSTRUCTIONS_PATH, 'utf-8');
            } else {
              customInstructions = 'The user closed the draw2agent session. Please summarize the changes you made.';
            }
            isErrorResult = false; // Intentional close isn't a tool failure
            
            // Cleanly shut down the dev server so the next request spins up a new tab
            stopHttpServer();
            setProxyInfo('');
          } else {
            if (fs.existsSync(ERROR_INSTRUCTIONS_PATH)) {
              customInstructions = fs.readFileSync(ERROR_INSTRUCTIONS_PATH, 'utf-8').replace('{{ERROR_MESSAGE}}', message);
            }
          }
        } catch (e) {
          console.error('[draw2agent] Failed to read fallback instructions.', e);
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: customInstructions,
            },
          ],
          isError: isErrorResult,
        };
      }
    }
  );

  return server;
}
