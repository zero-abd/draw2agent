/**
 * draw2agent — Floating Toolbar
 */
import React from 'react';

export type DrawMode = 'select' | 'draw';

interface ToolbarProps {
  mode: DrawMode;
  onModeChange: (mode: DrawMode) => void;
  onSubmit: () => void;
  onClear: () => void;
  onClose: () => void;
  isCapturing: boolean;
  toast: string | null;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  mode,
  onModeChange,
  onSubmit,
  onClear,
  onClose,
  isCapturing,
  toast,
}) => {
  return (
    <div className="d2a-toolbar">
      <div className="d2a-toolbar-inner">
        <div className="d2a-toolbar-brand">✏️ draw2agent</div>

        <div className="d2a-toolbar-divider" />

        <button
          className={`d2a-btn ${mode === 'select' ? 'd2a-btn-active' : ''}`}
          onClick={() => onModeChange('select')}
          title="Use the underlying website normally (Esc)"
        >
          🖱 Use Website
        </button>

        <button
          className={`d2a-btn ${mode === 'draw' ? 'd2a-btn-active' : ''}`}
          onClick={() => onModeChange('draw')}
          title="Draw mode — draw on the page"
        >
          ✏️ Draw
        </button>

        <div className="d2a-toolbar-divider" />

        <button
          className="d2a-btn d2a-btn-submit"
          onClick={onSubmit}
          disabled={isCapturing}
          title="Send drawings to the agent to make code changes"
        >
          {isCapturing ? '⏳ Processing...' : '🪄 Make Changes'}
        </button>

        <div className="d2a-toolbar-divider" />

        <button
          className="d2a-btn"
          onClick={onClear}
          title="Clear all drawings from the canvas"
        >
          🗑 Clear
        </button>

        <button
          className="d2a-btn d2a-btn-close"
          onClick={onClose}
          title="Close the canvas and end the session"
          style={{ color: '#ff6b6b' }}
        >
          ❌ Close
        </button>
      </div>

      {toast && (
        <div className={`d2a-toast ${toast.startsWith('❌') ? 'd2a-toast-error' : ''}`}>
          {toast}
        </div>
      )}
    </div>
  );
};
