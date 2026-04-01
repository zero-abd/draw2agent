/**
 * draw2agent — Tunnel manager
 * Exposes a local port over the internet via localtunnel.
 */
import localtunnel from 'localtunnel';

let activeTunnel: localtunnel.Tunnel | null = null;

export async function startTunnel(localPort: number): Promise<string> {
  // Close any existing tunnel first
  await stopTunnel();

  const tunnel = await localtunnel({ port: localPort });

  tunnel.on('close', () => {
    console.error('[draw2agent] 🔌 Tunnel closed');
    activeTunnel = null;
  });

  tunnel.on('error', (err) => {
    console.error('[draw2agent] Tunnel error:', err.message);
  });

  activeTunnel = tunnel;
  console.error(`[draw2agent] 🌐 Tunnel opened: ${tunnel.url}`);
  return tunnel.url;
}

export async function stopTunnel(): Promise<void> {
  if (activeTunnel) {
    activeTunnel.close();
    activeTunnel = null;
  }
}

export function getTunnelUrl(): string | null {
  return activeTunnel?.url ?? null;
}
