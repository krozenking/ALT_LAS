import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

interface LazyLoadProps {
  height?: string;
  width?: string;
  threshold?: number;
  placeholder?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * LazyLoad component for lazy loading content when it comes into view
 * 
 * @param height - Height of the container
 * @param width - Width of the container
 * @param threshold - Intersection threshold (0-1)
 * @param placeholder - Placeholder to show while loading
 * @param children - Content to lazy load
 */
const LazyLoad: React.FC<LazyLoadProps> = ({
  height = 'auto',
  width = '100%',
  threshold = 0.1,
  placeholder = <DefaultPlaceholder />,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
      }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, [threshold]);
  
  useEffect(() => {
    if (isVisible) {
      // Simulate loading delay
      const timer = setTimeout(() => {
        setHasLoaded(true);
      }, 100);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [isVisible]);
  
  return (
    <Container ref={containerRef} height={height} width={width}>
      {hasLoaded ? children : placeholder}
    </Container>
  );
};

const DefaultPlaceholder: React.FC = () => {
  return (
    <PlaceholderContainer>
      <Spinner />
    </PlaceholderContainer>
  );
};

interface ContainerProps {
  height: string;
  width: string;
}

const Container = styled.div<ContainerProps>`
  height: ${props => props.height};
  width: ${props => props.width};
  overflow: hidden;
`;

const PlaceholderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 100px;
  background-color: #f5f7fb;
`;

const spin = `
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid #e0e0e0;
  border-top: 2px solid #0084ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  ${spin}
`;

export default LazyLoad;
