import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startHttpServer, stopHttpServer } from './dist/http-server.js';
import { clearState, waitForState } from './dist/state-store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runLocalTest() {
    const proxyUrl = await startHttpServer('http://localhost:3000', 9742);
    console.log(`\n================================`);
    console.log(`✅ Local test proxy running!`);
    console.log(`🌍 Open your browser to: ${proxyUrl}`);
    console.log(`1. Scroll down the page on the d2a_web app.`);
    console.log(`2. Draw a cross on an element.`);
    console.log(`3. Click 'Make Changes'.`);
    console.log(`4. The result will be saved to test-output.png.`);
    console.log(`================================\n`);

    while (true) {
        clearState();
        console.log('Waiting for "Make Changes" submission...');
        try {
            const state = await waitForState();
            console.log('📥 Received state from overlay!');

            const base64Data = state.annotatedScreenshot.replace(/^data:image\/\w+;base64,/, '');
            const outPath = path.join(__dirname, 'test-output.png');
            fs.writeFileSync(outPath, base64Data, 'base64');

            console.log(`🖼️ Saved screenshot to ${outPath}!`);
            console.log(`Please open ${outPath} to visually verify the coordinate mapping.`);
            console.log('\nReady for another test. Draw more and submit!');
        } catch (err) {
            console.error('Test loop error:', err);
        }
    }
}

// Give users a clean exit if they CTRL+C
process.on('SIGINT', () => {
    stopHttpServer();
    console.log('\nStopped local test server.');
    process.exit(0);
});

runLocalTest().catch(console.error);
