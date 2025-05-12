import React from 'react';
import './Panel.css';

interface PanelProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
  resizable?: boolean; // Future use for resizing
  draggable?: boolean; // Future use for dragging
}

const Panel: React.FC<PanelProps> = ({ title, children, className, resizable, draggable }) => {
  // TODO: Implement drag-and-drop and resizing logic based on UI/UX plan
  // TODO: Implement keyboard navigation for panels

  return (
    <div className={`panel-container ${className || ''}`}>
      <div className="panel-header">
        <h3>{title}</h3>
        {/* Placeholder for controls like close, minimize, drag handle */}
      </div>
      <div className="panel-content">
        {children || <p>Default content for {title}.</p>}
      </div>
    </div>
  );
};

export default Panel;

