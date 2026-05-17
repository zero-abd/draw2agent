/**
 * draw2agent — Network utilities
 * Detects the machine's LAN IPv4 address so iPad/mobile devices on the
 * same Wi-Fi network can reach the proxy directly (no internet tunnel).
 */
import os from 'node:os';

// Virtual / non-physical adapters that should not be advertised to the iPad —
// these are reachable from the host but not from a real device on the Wi-Fi.
const VIRTUAL_ADAPTER_HINTS = [
  'vmware',
  'virtualbox',
  'vethernet',
  'hyper-v',
  'wsl',
  'docker',
  'loopback',
  'bluetooth',
  'tailscale',
  'zerotier',
  'utun',
  'tun',
  'tap',
];

/**
 * Scores an address: lower is better. Used to pick the address most likely
 * reachable by another device on the same physical network.
 */
function scoreAddress(name: string, address: string): number {
  let score = 0;

  // Strongly deprioritize known virtual adapters.
  const lowerName = name.toLowerCase();
  if (VIRTUAL_ADAPTER_HINTS.some((hint) => lowerName.includes(hint))) {
    score += 1000;
  }

  // Link-local / APIPA (169.254.x.x) — only works in degraded scenarios.
  if (address.startsWith('169.254.')) {
    score += 500;
  }

  // Prefer typical home/office LAN ranges first, then other private/shared
  // ranges, then anything else.
  if (address.startsWith('192.168.')) {
    score += 0;
  } else if (address.startsWith('10.')) {
    score += 1;
  } else if (/^172\.(1[6-9]|2\d|3[01])\./.test(address)) {
    score += 2;
  } else if (/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(address)) {
    // 100.64.0.0/10 — carrier-grade NAT / shared address space, used by some
    // routers and mobile hotspots. Reachable between devices on that NAT.
    score += 3;
  } else {
    score += 10;
  }

  return score;
}

/**
 * Returns the most likely LAN IPv4 address of this machine, or null if none
 * could be determined (e.g. the machine is offline / has no network).
 *
 * Prefers real physical adapters (Wi-Fi/Ethernet) with a routable private
 * address and deprioritizes virtual adapters (VMware, WSL, Hyper-V, etc.).
 */
export function getLanIp(): string | null {
  const interfaces = os.networkInterfaces();
  const candidates: { address: string; score: number }[] = [];

  for (const [name, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;

    for (const addr of addrs) {
      // Node <18 exposes `family` as a string ('IPv4'); >=18 as a number (4).
      const isIPv4 = addr.family === 'IPv4' || (addr.family as unknown) === 4;
      if (!isIPv4 || addr.internal) continue;
      candidates.push({ address: addr.address, score: scoreAddress(name, addr.address) });
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => a.score - b.score);
  return candidates[0].address;
}
