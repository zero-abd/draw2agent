/**
 * draw2agent — Capture module
 * Screenshots the page, exports annotations, serializes DOM nodes.
 */
import * as htmlToImage from 'html-to-image';

const D2A_ROOT_ID = 'draw2agent-root';
const CAPTURE_URL = '/__d2a__/capture';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SerializedDOMNode {
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

/**
 * Get a CSS selector path for an element.
 */
function getCssSelector(el: Element): string {
  const parts: string[] = [];
  let current: Element | null = el;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    if (current.id) {
      selector = `#${current.id}`;
      parts.unshift(selector);
      break;
    }
    if (current.className && typeof current.className === 'string') {
      const classes = current.className.trim().split(/\s+/).slice(0, 2).join('.');
      if (classes) selector += `.${classes}`;
    }
    // Add nth-child for specificity
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (c) => c.tagName === current!.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-child(${index})`;
      }
    }
    parts.unshift(selector);
    current = current.parentElement;
  }

  return parts.join(' > ');
}

/**
 * Serialize relevant computed styles for a DOM node.
 */
function getRelevantStyles(el: Element): Record<string, string> {
  const computed = window.getComputedStyle(el);
  const props = [
    'display', 'position', 'width', 'height',
    'margin', 'padding',
    'color', 'backgroundColor', 'background',
    'fontSize', 'fontFamily', 'fontWeight', 'lineHeight',
    'border', 'borderRadius',
    'flexDirection', 'justifyContent', 'alignItems', 'gap',
    'gridTemplateColumns', 'gridTemplateRows',
    'overflow', 'zIndex', 'opacity',
  ];
  const styles: Record<string, string> = {};
  for (const prop of props) {
    const val = computed.getPropertyValue(
      prop.replace(/([A-Z])/g, '-$1').toLowerCase()
    );
    if (val && val !== 'none' && val !== 'normal' && val !== 'auto' && val !== '0px') {
      styles[prop] = val;
    }
  }
  return styles;
}

/**
 * Serialize a DOM element.
 */
function serializeElement(el: Element): SerializedDOMNode {
  const rect = el.getBoundingClientRect();
  const attrs: Record<string, string> = {};
  for (const attr of Array.from(el.attributes)) {
    if (['style', 'class', 'id'].includes(attr.name)) continue;
    attrs[attr.name] = attr.value.slice(0, 200);
  }

  return {
    tagName: el.tagName.toLowerCase(),
    id: el.id || '',
    className: el.className && typeof el.className === 'string' ? el.className : '',
    attributes: attrs,
    computedStyles: getRelevantStyles(el),
    innerText: (el as HTMLElement).innerText?.slice(0, 500) || '',
    outerHTML: el.outerHTML.slice(0, 2000),
    boundingRect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
    cssSelector: getCssSelector(el),
  };
}

/**
 * Find all DOM elements intersecting a bounding box.
 */
function getElementsInBounds(bounds: BoundingBox): SerializedDOMNode[] {
  const allElements = document.querySelectorAll('body *');
  const nodes: SerializedDOMNode[] = [];
  const seen = new Set<Element>();

  for (const el of allElements) {
    // Skip our overlay elements
    if ((el as HTMLElement).closest(`#${D2A_ROOT_ID}`)) continue;
    // Skip invisible elements
    if ((el as HTMLElement).offsetParent === null && el.tagName !== 'BODY') continue;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    // Check intersection with bounds
    const intersects =
      rect.left < bounds.x + bounds.width &&
      rect.right > bounds.x &&
      rect.top < bounds.y + bounds.height &&
      rect.bottom > bounds.y;

    if (intersects && !seen.has(el)) {
      seen.add(el);
      nodes.push(serializeElement(el));
    }
  }

  // Limit to most relevant nodes (prefer smaller, more specific elements)
  return nodes
    .sort((a, b) => (a.boundingRect.width * a.boundingRect.height) - (b.boundingRect.width * b.boundingRect.height))
    .slice(0, 50);
}

/**
 * Screenshot the entire visible page including the draw2agent overlay.
 */
async function takeScreenshot(): Promise<string> {
  const toolbar = document.querySelector('.d2a-toolbar') as HTMLElement | null;
  if (toolbar) toolbar.style.display = 'none';

  try {
    const dataUrl = await htmlToImage.toPng(document.body, {
      pixelRatio: window.devicePixelRatio || 1,
      skipFonts: true, // Speeds up capture and prevents some CORS issues
    });
    return dataUrl;
  } finally {
    if (toolbar) toolbar.style.display = '';
  }
}

/**
 * Crop a base64 image to a bounding box.
 */
function cropImage(dataUrl: string, bounds: BoundingBox): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const dpr = window.devicePixelRatio || 1;
      canvas.width = bounds.width * dpr;
      canvas.height = bounds.height * dpr;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No 2d context');

      ctx.drawImage(
        img,
        bounds.x * dpr, bounds.y * dpr,
        bounds.width * dpr, bounds.height * dpr,
        0, 0,
        bounds.width * dpr, bounds.height * dpr
      );
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Composite two base64 images (drawings over background).
 * The overlayUrl should be exactly the same dimensions as the background.
 */
function compositeImages(backgroundUrl: string, overlayUrl: string, width: number, height: number, scrollX: number, scrollY: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject('No 2d context');

    const bgImg = new Image();
    const fgImg = new Image();

    bgImg.onload = () => {
      // Draw the cropped viewport area of the full-page screenshot
      ctx.drawImage(
        bgImg,
        scrollX * dpr,
        scrollY * dpr,
        canvas.width,
        canvas.height,
        0,
        0,
        canvas.width,
        canvas.height
      );
      fgImg.onload = () => {
        // Overlay is already viewport-sized
        ctx.drawImage(fgImg, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      };
      fgImg.onerror = reject;
      fgImg.src = overlayUrl;
    };
    bgImg.onerror = reject;
    bgImg.src = backgroundUrl;
  });
}

export interface CaptureResult {
  success: boolean;
  error?: string;
}

/**
 * Run the full capture pipeline and submit to the MCP server.
 */
export async function captureAndSubmit(
  getExcalidrawElements: () => unknown[],
  exportAnnotationImage: () => Promise<string>,
  getDrawingBounds: () => BoundingBox | null,
): Promise<CaptureResult> {
  try {
    const annotations = getExcalidrawElements();
    const bounds = getDrawingBounds();

    if (!bounds || annotations.length === 0) {
      return { success: false, error: 'No annotations drawn. Draw something first!' };
    }

    // 1. Take a screenshot of the page (html-to-image cannot capture <canvas> content)
    const pageScreenshot = await takeScreenshot();

    // 2. Export Excalidraw annotations as a transparent overlay image
    const annotationOverlay = await exportAnnotationImage();

    let annotatedScreenshot = pageScreenshot;
    if (annotationOverlay) {
      annotatedScreenshot = await compositeImages(
        pageScreenshot,
        annotationOverlay,
        window.innerWidth,
        window.innerHeight,
        window.scrollX,
        window.scrollY
      );
    }

    // 4. Crop the composited image to just the drawing area
    let croppedScreenshot = annotatedScreenshot;
    try {
      croppedScreenshot = await cropImage(annotatedScreenshot, bounds);
    } catch {
      // Fall back to the full annotated screenshot
    }

    // 5. Serialize DOM nodes in the drawn area
    const domNodes = getElementsInBounds(bounds);

    // 6. Assemble payload
    const payload = {
      timestamp: new Date().toISOString(),
      targetUrl: window.location.origin,
      viewportSize: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      pageScreenshot,
      croppedScreenshot,
      annotatedScreenshot,
      drawingBounds: bounds,
      annotations,
      domNodes,
    };

    // 8. Submit to MCP server
    const response = await fetch(CAPTURE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
