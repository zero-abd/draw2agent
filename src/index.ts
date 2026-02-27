/**
 * draw2agent — Entry point
 * Starts the MCP server with stdio transport.
 */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer } from './mcp-server.js';

async function main() {
  const server = createMcpServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);
  console.error('[draw2agent] MCP server running on stdio');
}

main().catch((err) => {
  console.error('[draw2agent] Fatal error:', err);
  process.exit(1);
});
