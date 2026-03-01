/**
 * draw2agent — Main App component
 * Renders Excalidraw as a transparent overlay on top of the page.
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Excalidraw, exportToBlob } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import { Toolbar, type DrawMode } from './Toolbar';
import { captureAndSubmit } from './capture';
import '@excalidraw/excalidraw/index.css';
import './styles.css';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const App: React.FC = () => {
  const [mode, setMode] = useState<DrawMode>('select');
  const [isCapturing, setIsCapturing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const excalidrawApiRef = useRef<ExcalidrawImperativeAPI | null>(null);

  // Show toast with auto-dismiss
  const showToast = useCallback((message: string, duration = 3000) => {
    setToast(message);
    setTimeout(() => setToast(null), duration);
  }, []);

  // Escape key → select mode
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMode('select');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Make the Excalidraw properties, shape toolbar, and library panels movable
  useEffect(() => {
    let isDragging = false;
    let currentPanel: HTMLElement | null = null;
    let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;

      // Find one of our draggable panels
      const panel = target.closest('.App-menu_top__left, .App-toolbar-container, .layer-ui__wrapper__top-right, .d2a-toolbar') as HTMLElement;
      if (!panel) return;

      // Don't drag if clicking buttons, inputs, labels, or anything interactive
      if (
        target.tagName.match(/INPUT|BUTTON|SELECT|TEXTAREA|LABEL/) ||
        target.closest('button') ||
        target.closest('label') ||
        target.closest('.ToolIcon_type_radio') ||
        target.closest('.color-picker__button') ||
        target.closest('.layer-ui__library-button')
      ) {
        return;
      }

      // If clicking inside the inner tool stack (mostly for main toolbar/properties wrapper), only block if it's an interactive descendant
      if (target.closest('.Stack') && target.closest('.Stack')?.children.length && target !== panel) {
        if (!target.classList.contains('App-toolbar-container') &&
          !target.classList.contains('Island') &&
          !target.closest('.layer-ui__wrapper__top-right')) {
          return;
        }
      }

      // Stop Excalidraw from drawing
      e.stopPropagation();
      e.preventDefault();

      isDragging = true;
      currentPanel = panel;
      startX = e.clientX;
      startY = e.clientY;

      const rect = panel.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      // Set explicit fixed positioning with !important to override Excalidraw CSS
      panel.style.setProperty('transition', 'none', 'important');
      panel.style.setProperty('position', 'fixed', 'important');
      panel.style.setProperty('margin', '0', 'important');
      panel.style.setProperty('transform', 'none', 'important');
      panel.style.setProperty('bottom', 'auto', 'important');
      panel.style.setProperty('right', 'auto', 'important');
      panel.style.setProperty('left', `${initialLeft}px`, 'important');
      panel.style.setProperty('top', `${initialTop}px`, 'important');
      panel.style.setProperty('z-index', '100000', 'important');

      // Add dragging class to body to disable canvas pointer events
      document.body.classList.add('d2a-is-dragging-panel');

      // Capture pointer so dragging works even if cursor leaves the panel
      panel.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging || !currentPanel) return;
      e.stopPropagation();
      e.preventDefault();

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      currentPanel.style.setProperty('left', `${initialLeft + dx}px`, 'important');
      currentPanel.style.setProperty('top', `${initialTop + dy}px`, 'important');
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isDragging) {
        e.stopPropagation();
        if (currentPanel) {
          currentPanel.releasePointerCapture(e.pointerId);
        }
      }
      isDragging = false;
      currentPanel = null;
      document.body.classList.remove('d2a-is-dragging-panel');
    };

    // Use capture phase to intercept before Excalidraw's canvas handlers
    document.addEventListener('pointerdown', handlePointerDown, { capture: true, passive: false });
    window.addEventListener('pointermove', handlePointerMove, { capture: true, passive: false });
    window.addEventListener('pointerup', handlePointerUp, { capture: true });

    // Also add visual CSS handles dynamically
    const styleInterval = setInterval(() => {
      const panels = document.querySelectorAll('.App-menu_top__left, .App-toolbar-container, .layer-ui__wrapper__top-right, .d2a-toolbar');
      panels.forEach((el) => {
        const panel = el as HTMLElement;
        if (!panel.dataset.d2aDraggable) {
          panel.dataset.d2aDraggable = 'true';
        }
      });
    }, 1000);

    return () => {
      clearInterval(styleInterval);
      document.removeEventListener('pointerdown', handlePointerDown, { capture: true });
      window.removeEventListener('pointermove', handlePointerMove, { capture: true });
      window.removeEventListener('pointerup', handlePointerUp, { capture: true });
      document.body.classList.remove('d2a-is-dragging-panel');
    };
  }, []);

  // Set default tool to pen with thin stroke when in draw mode
  useEffect(() => {
    if (mode === 'draw' && excalidrawApiRef.current) {
      excalidrawApiRef.current.updateScene({
        appState: {
          activeTool: { type: 'freedraw', customType: null, lastActiveTool: null, locked: false },
          currentItemStrokeWidth: 1, // Set default thickness to round thin
          currentItemStrokeStyle: 'solid',
        }
      });
    }
  }, [mode]);

  // Handle Clear
  const handleClear = useCallback(() => {
    // We update scene elements to empty instead of resetScene()
    // because resetScene defaults the AppState background back to white!
    excalidrawApiRef.current?.updateScene({ elements: [] });
  }, []);

  // Handle Close
  const handleClose = useCallback(async () => {
    try {
      await fetch('/__d2a__/close', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    // Attempt to close the tab
    window.close();

    // Fallback UI if window.close() is blocked
    document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#111;color:#fff;font-family:sans-serif;font-size:24px;">draw2agent session closed. You can safely close this tab.</div>';
  }, []);

  // Get bounding box of all Excalidraw elements
  const getDrawingBounds = useCallback((): BoundingBox | null => {
    const api = excalidrawApiRef.current;
    if (!api) return null;

    const elements = api.getSceneElements().filter((el: ExcalidrawElement) => !el.isDeleted);
    if (elements.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const el of elements) {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height);
    }

    // Add padding
    const padding = 20;
    return {
      x: Math.max(0, minX - padding),
      y: Math.max(0, minY - padding),
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    };
  }, []);

  // Get Excalidraw elements as JSON
  const getExcalidrawElements = useCallback((): unknown[] => {
    const api = excalidrawApiRef.current;
    if (!api) return [];
    return api.getSceneElements().filter((el: ExcalidrawElement) => !el.isDeleted);
  }, []);

  // Export annotation image (drawings composited on a transparent background)
  const exportAnnotationImage = useCallback(async (): Promise<string> => {
    const api = excalidrawApiRef.current;
    if (!api) return '';

    const elements = api.getSceneElements().filter((el: ExcalidrawElement) => !el.isDeleted);
    if (elements.length === 0) return '';

    try {
      const blob = await exportToBlob({
        elements,
        appState: {
          ...api.getAppState(),
          exportBackground: false,
          exportWithDarkMode: true,
        },
        files: api.getFiles(),
      });
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch {
      return '';
    }
  }, []);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    setIsCapturing(true);

    // Small delay to let UI update and CSS pseudo-classes hide the toolbars
    await new Promise((r) => setTimeout(r, 200));

    const result = await captureAndSubmit(
      getExcalidrawElements,
      exportAnnotationImage,
      getDrawingBounds,
    );

    setIsCapturing(false);

    if (result.success) {
      showToast('✅ Captured! Your agent has the context.');
    } else {
      showToast(`❌ ${result.error || 'Capture failed'}`, 5000);
    }
  }, [getExcalidrawElements, exportAnnotationImage, getDrawingBounds, showToast]);

  return (
    <>
      {/* Excalidraw canvas overlay */}
      <div
        className={`d2a-canvas-container ${isCapturing ? 'd2a-capturing' : ''}`}
        data-mode={mode}
        style={{ pointerEvents: mode === 'draw' && !isCapturing ? 'all' : 'none' }}
      >
        <Excalidraw
          excalidrawAPI={(api) => {
            excalidrawApiRef.current = api;
          }}
          initialData={{
            appState: {
              viewBackgroundColor: 'transparent',
              theme: 'dark',
              gridSize: undefined,
            },
          }}
          UIOptions={{
            canvasActions: {
              changeViewBackgroundColor: false,
              clearCanvas: true,
              loadScene: false,
              saveToActiveFile: false,
              toggleTheme: false,
              export: false,
            },
          }}
        />
      </div>

      {/* Toolbar — always interactive */}
      <Toolbar
        mode={mode}
        onModeChange={setMode}
        onSubmit={handleSubmit}
        onClear={handleClear}
        onClose={handleClose}
        isCapturing={isCapturing}
        toast={toast}
      />
    </>
  );
};
