import React, { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import "./Panel.css";

interface PanelProps {
  id: string; // Added id for focusing and ARIA
  title: string;
  children?: React.ReactNode;
  className?: string;
  resizable?: boolean;
  draggable?: boolean;
  ariaLabel?: string; // For accessibility
  onClose?: () => void; // Optional close handler
  onMaximize?: () => void; // Optional maximize handler
}

const Panel: React.FC<PanelProps> = ({
  id,
  title,
  children,
  className,
  ariaLabel,
  resizable = true,
  draggable = true,
  onClose,
  onMaximize
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Focus this panel when its hotkey is pressed (handled in MainLayout)
  useHotkeys("ctrl+shift+" + id.charAt(id.length -1), () => panelRef.current?.focus(), {preventDefault: true}, [id]);

  // Handle drag start/end for visual feedback
  const handleDragStart = () => {
    if (draggable) {
      setIsDragging(true);
      document.body.classList.add('panel-dragging');
    }
  };

  const handleDragEnd = () => {
    if (draggable) {
      setIsDragging(false);
      document.body.classList.remove('panel-dragging');
    }
  };

  // Handle resize start/end for visual feedback
  const handleResizeStart = () => {
    if (resizable) {
      setIsResizing(true);
      document.body.classList.add('panel-resizing');
    }
  };

  const handleResizeEnd = () => {
    if (resizable) {
      setIsResizing(false);
      document.body.classList.remove('panel-resizing');
    }
  };

  return (
    <div
      id={id}
      ref={panelRef}
      className={`panel-container ${className || ""} ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''}`}
      tabIndex={0} // Make panel focusable
      role="region" // ARIA role
      aria-labelledby={`${id}-header`} // ARIA labelled by header
    >
      <div
        className="panel-header"
        id={`${id}-header`}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        <h3>{title}</h3>
        <div className="panel-controls">
          {onMaximize && (
            <button
              className="panel-control maximize-button"
              onClick={onMaximize}
              aria-label="Maximize panel"
            >
              <span className="maximize-icon">⛶</span>
            </button>
          )}
          {onClose && (
            <button
              className="panel-control close-button"
              onClick={onClose}
              aria-label="Close panel"
            >
              <span className="close-icon">×</span>
            </button>
          )}
        </div>
      </div>
      <div
        className="panel-content"
        role="document"
        aria-label={ariaLabel || `${title} content`}
      >
        {children || <p>Default content for {title}.</p>}
      </div>
      {resizable && (
        <div
          className="panel-resize-handle"
          onMouseDown={handleResizeStart}
          onMouseUp={handleResizeEnd}
          onMouseLeave={handleResizeEnd}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Panel;

