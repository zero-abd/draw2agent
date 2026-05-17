/**
 * test-ipad.ts — Manual test harness for the launch_ipad_canvas flow.
 * Mirrors the MCP tool: starts the proxy, resolves the LAN IP, shows a QR
 * code, and waits for an iPad on the same Wi-Fi to submit a drawing.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startHttpServer, stopHttpServer, setQrPage } from './src/http-server.js';
import { clearState, waitForState } from './src/state-store.js';
import { generateQR } from './src/utils/qrcode.js';
import { getLanIp } from './src/utils/network.js';
import { openBrowser } from './src/utils/browser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TARGET_URL = process.env.D2A_TARGET ?? 'http://localhost:3000';
const PROXY_PORT = Number(process.env.D2A_PORT ?? 9742);

async function run() {
  const lanIp = getLanIp();
  if (!lanIp) {
    console.error('❌ No LAN IP found. Connect to Wi-Fi/Ethernet and retry.');
    process.exit(1);
  }

  await startHttpServer(TARGET_URL, PROXY_PORT);

  const ipadUrl = `http://${lanIp}:${PROXY_PORT}`;
  const qr = await generateQR(ipadUrl);

  const qrHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>draw2agent — Scan to Draw</title></head><body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#1e1e2e;color:white;font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:24px;box-sizing:border-box;"><h1 style="margin:0 0 8px;">📱 Scan to Draw</h1><p style="margin:0 0 24px;opacity:0.8;max-width:420px;">Scan this QR code with your iPad's camera to start annotating. Your iPad must be on the <strong>same Wi-Fi network</strong> as this computer.</p><img src="${qr.dataUrl}" alt="QR code" style="border-radius:12px;width:300px;height:300px;background:#fff;"/><p style="margin:24px 0 0;font-size:1.1rem;background:#ffffff10;padding:8px 16px;border-radius:8px;">${ipadUrl}</p><p style="margin:16px 0 0;opacity:0.5;font-size:0.85rem;max-width:420px;">If your iPad can't connect, make sure this computer's firewall allows incoming connections on port ${PROXY_PORT}.</p></body></html>`;
  setQrPage(qrHtml);
  const qrPageUrl = `http://127.0.0.1:${PROXY_PORT}/__d2a__/qr`;
  await openBrowser(qrPageUrl);

  console.log('\n================================');
  console.log('✅ iPad canvas test running!');
  console.log(`🎯 Target dev server : ${TARGET_URL}`);
  console.log(`🌐 iPad URL (LAN)    : ${ipadUrl}`);
  console.log(`🖥️  QR page (open this if no tab popped): ${qrPageUrl}`);
  console.log('📱 A browser tab with the QR code should have opened — scan it from your iPad.');
  console.log('   Also printing the QR in the terminal as a fallback:\n');
  console.log(qr.ascii);
  console.log('================================\n');

  // Keep waiting for submissions so the user can try multiple times.
  while (true) {
    clearState();
    console.log('⏳ Waiting for a drawing submission from the iPad...');
    try {
      const state = await waitForState();
      const base64 = state.annotatedScreenshot.replace(/^data:image\/\w+;base64,/, '');
      const outPath = path.join(__dirname, 'test-ipad-output.png');
      fs.writeFileSync(outPath, base64, 'base64');
      console.log(`📥 Received drawing! Saved annotated screenshot to ${outPath}`);
      console.log(`   viewport=${JSON.stringify(state.viewportSize)} annotations=${state.annotations.length}`);
      console.log('   Draw again on the iPad to test another submission.\n');
    } catch (err) {
      console.error('⚠️  Session error:', err instanceof Error ? err.message : err);
      console.log('   (Restart this test if the session was closed.)\n');
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
}

process.on('SIGINT', () => {
  stopHttpServer();
  console.log('\n🛑 Stopped iPad canvas test.');
  process.exit(0);
});

run().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
