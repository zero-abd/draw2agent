/**
 * draw2agent — Self-mounting entry point
 * Creates a container div and renders the overlay app.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const ROOT_ID = 'draw2agent-root';

function mount() {
  // Don't double-mount
  if (document.getElementById(ROOT_ID)) return;

  const container = document.createElement('div');
  container.id = ROOT_ID;
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  console.log('[draw2agent] ✏️ Overlay mounted');
}

// Mount when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
