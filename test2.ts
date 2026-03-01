import { startHttpServer } from './src/http-server.js';
import { waitForState } from './src/state-store.js';
import fs from 'node:fs';

async function run() {
    const url = await startHttpServer('http://127.0.0.1:3000', 9742);
    console.log(`[Test] Proxy server running at ${url}`);

    console.log('[Test] Waiting for state...');
    const state = await waitForState();

    console.log('[Test] Received state!');
    fs.writeFileSync('test-output.png', state.croppedScreenshot.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    console.log('[Test] Saved cropped screenshot to test-output.png');
    process.exit(0);
}

run().catch(console.error);
