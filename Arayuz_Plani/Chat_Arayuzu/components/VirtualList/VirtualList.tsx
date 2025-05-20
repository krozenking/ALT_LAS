import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  width?: string;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

/**
 * VirtualList component for efficiently rendering large lists
 * 
 * @param items - Array of items to render
 * @param itemHeight - Height of each item in pixels
 * @param height - Height of the container in pixels
 * @param width - Width of the container
 * @param overscan - Number of items to render outside of the visible area
 * @param renderItem - Function to render each item
 */
function VirtualList<T>({
  items,
  itemHeight,
  height,
  width = '100%',
  overscan = 3,
  renderItem,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setScrollTop(containerRef.current.scrollTop);
      }
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);
  
  // Calculate the range of visible items
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + height) / itemHeight) + overscan
  );
  
  // Calculate the total height of all items
  const totalHeight = items.length * itemHeight;
  
  // Calculate the offset for the visible items
  const offsetY = startIndex * itemHeight;
  
  // Get the visible items
  const visibleItems = items.slice(startIndex, endIndex + 1);
  
  return (
    <Container ref={containerRef} height={height} width={width}>
      <InnerContainer height={totalHeight}>
        <ItemsContainer offsetY={offsetY}>
          {visibleItems.map((item, index) => (
            <ItemContainer key={startIndex + index} height={itemHeight}>
              {renderItem(item, startIndex + index)}
            </ItemContainer>
          ))}
        </ItemsContainer>
      </InnerContainer>
    </Container>
  );
}

interface ContainerProps {
  height: number;
  width: string;
}

const Container = styled.div<ContainerProps>`
  height: ${props => `${props.height}px`};
  width: ${props => props.width};
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  will-change: transform;
`;

interface InnerContainerProps {
  height: number;
}

const InnerContainer = styled.div<InnerContainerProps>`
  height: ${props => `${props.height}px`};
  width: 100%;
  position: relative;
`;

interface ItemsContainerProps {
  offsetY: number;
}

const ItemsContainer = styled.div<ItemsContainerProps>`
  position: absolute;
  top: ${props => `${props.offsetY}px`};
  left: 0;
  width: 100%;
  will-change: transform;
`;

interface ItemContainerProps {
  height: number;
}

const ItemContainer = styled.div<ItemContainerProps>`
  height: ${props => `${props.height}px`};
  width: 100%;
`;

export default VirtualList;
