/**
 * draw2agent — In-memory state store
 * Holds the latest captured drawing state from the overlay.
 */

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SerializedDOMNode {
  tagName: string;
  id: string;
  className: string;
  attributes: Record<string, string>;
  computedStyles: Record<string, string>;
  innerText: string;
  outerHTML: string;
  boundingRect: BoundingBox;
  cssSelector: string;
}

export interface DrawingState {
  timestamp: string;
  targetUrl: string;
  viewportSize: { width: number; height: number };
  pageScreenshot: string;
  croppedScreenshot: string;
  annotatedScreenshot: string;
  drawingBounds: BoundingBox;
  annotations: unknown[];
  domNodes: SerializedDOMNode[];
}

let currentState: DrawingState | null = null;
let proxyInfo: { running: boolean; url: string } = { running: false, url: '' };
let resolvePendingState: ((state: DrawingState) => void) | null = null;
let rejectPendingState: ((reason?: any) => void) | null = null;
let isSessionClosed = false; // Queue intended closures to prevent race conditions

export function waitForState(): Promise<DrawingState> {
  return new Promise((resolve, reject) => {
    if (isSessionClosed) {
      isSessionClosed = false;
      return reject(new Error('User closed the draw2agent session.'));
    }

    resolvePendingState = resolve;
    rejectPendingState = reject;

    // Failsafe timeout: 10 minutes
    setTimeout(() => {
      if (rejectPendingState) {
        rejectPendingState(new Error('User did not submit a drawing within 10 minutes. Canvas launch timed out.'));
        resolvePendingState = null;
        rejectPendingState = null;
      }
    }, 10 * 60 * 1000);
  });
}

export function setState(state: DrawingState): void {
  currentState = state;
  if (resolvePendingState) {
    resolvePendingState(state);
    resolvePendingState = null;
    rejectPendingState = null;
  }
}

export function rejectState(errorMsg: string): void {
  if (errorMsg.includes('User closed the draw2agent session')) {
    isSessionClosed = true;
  }
  if (rejectPendingState) {
    rejectPendingState(new Error(`draw2agent Error: ${errorMsg}`));
    resolvePendingState = null;
    rejectPendingState = null;
  }
}

export function getState(): DrawingState | null {
  return currentState;
}

export function clearState(): void {
  currentState = null;
  isSessionClosed = false;
}

export function setProxyInfo(url: string): void {
  proxyInfo = { running: true, url };
}

export function clearProxyInfo(): void {
  proxyInfo = { running: false, url: '' };
}

export function getProxyInfo(): { running: boolean; url: string } {
  return proxyInfo;
}
