# How to Test draw2agent Locally (Agent Instructions)

This project has a local test proxy that allows you (the AI agent) to test the `draw2agent` overlay functionality without needing to spin up the full MCP server or rely on an external client.

## 1. Start the Local Test Server
Before using the browser subagent, you must start the local proxy server.
Run the following background command in the `draw2agent` root directory:
```bash
npx tsx test-local.ts
```

*Note: The target demo app (`d2a_web`) must also be running locally (usually on `http://localhost:3000`). If it is not running, start it using `npm run dev` in the `d2a_web` directory.*

## 2. Launch the Browser Subagent
Once the proxy is running (it listens on `http://localhost:9743`), use the `browser_subagent` tool with the following task instructions:

**Example Task Description:**
"Open `http://localhost:9743`. Scroll down until you clearly see a target element on the page. Click the 'Draw' button in the bottom floating toolbar. Select the drawing tool (like the pencil or rectangle) from the Excalidraw UI. Draw a distinct annotation (like a large cross or circle) directly over the target element. Finally, click the 'Make Changes' button in the bottom floating toolbar and wait 5 seconds for the capture to process."

## 3. Verify the Output
After the browser subagent returns successfully:
1. The `test-local.ts` script intercepts the overlay's payload and saves the resulting composited image natively as `test-output.png` in the project root.
2. Use the `view_file` tool to inspect `test-output.png`. 
3. Visually verify that the drawn coordinates map perfectly to the background elements without any scaling, shifting, or squashing issues.

## 4. Cleanup
When your testing is complete, remember to terminate the `npx tsx test-local.ts` background process using the `send_command_input` tool with `Terminate: true`.
