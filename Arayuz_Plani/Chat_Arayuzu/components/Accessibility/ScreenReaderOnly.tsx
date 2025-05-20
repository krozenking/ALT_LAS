import React from 'react';
import styled from 'styled-components';

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * ScreenReaderOnly component for content that should only be visible to screen readers
 * 
 * @param children - Content to be read by screen readers
 * @param as - HTML element to render as
 */
const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({ 
  children, 
  as = 'span' 
}) => {
  return (
    <StyledScreenReaderOnly as={as}>
      {children}
    </StyledScreenReaderOnly>
  );
};

const StyledScreenReaderOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`;

export default ScreenReaderOnly;
