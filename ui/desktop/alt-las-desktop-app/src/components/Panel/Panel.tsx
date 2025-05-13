import React, { useRef } from "react";
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
}

const Panel: React.FC<PanelProps> = ({ id, title, children, className, ariaLabel }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Example: Focus this panel when its hotkey is pressed (handled in MainLayout)
  useHotkeys("ctrl+shift+" + id.charAt(id.length -1), () => panelRef.current?.focus(), {preventDefault: true}, [id]);

  return (
    <div 
      id={id} 
      ref={panelRef}
      className={`panel-container ${className || ""}`}
      tabIndex={0} // Make panel focusable
      role="region" // ARIA role
      aria-labelledby={`${id}-header`} // ARIA labelled by header
    >
      <div className="panel-header" id={`${id}-header`}>
        <h3>{title}</h3>
      </div>
      <div className="panel-content" role="document" aria-label={ariaLabel || `${title} content`}>
        {children || <p>Default content for {title}.</p>}
      </div>
    </div>
  );
};

export default Panel;

