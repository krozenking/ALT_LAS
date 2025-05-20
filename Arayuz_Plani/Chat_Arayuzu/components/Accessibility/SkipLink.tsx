import React from 'react';
import styled from 'styled-components';

interface SkipLinkProps {
  targetId: string;
  children?: React.ReactNode;
}

/**
 * SkipLink component for keyboard users to skip navigation
 * 
 * @param targetId - ID of the element to skip to
 * @param children - Content of the skip link
 */
const SkipLink: React.FC<SkipLinkProps> = ({ 
  targetId, 
  children = 'Skip to main content' 
}) => {
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.tabIndex = -1;
      target.focus();
      // Reset tabIndex after a short delay
      setTimeout(() => {
        target.removeAttribute('tabindex');
      }, 100);
    }
  };
  
  return (
    <StyledSkipLink href={`#${targetId}`} onClick={handleClick}>
      {children}
    </StyledSkipLink>
  );
};

const StyledSkipLink = styled.a`
  position: absolute;
  top: -40px;
  left: 0;
  background: #0084ff;
  color: white;
  padding: 8px;
  z-index: 100;
  transition: top 0.2s;
  
  &:focus {
    top: 0;
  }
`;

export default SkipLink;
