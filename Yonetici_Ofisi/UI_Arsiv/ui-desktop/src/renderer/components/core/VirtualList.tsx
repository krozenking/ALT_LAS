import React, { useCallback, useMemo } from 'react';
import { Box, BoxProps, useColorMode } from '@chakra-ui/react';

// Component for optimizing rendering of large lists
export interface VirtualListProps extends BoxProps {
  items: any[];
  itemHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  overscan?: number;
  height?: number | string;
  width?: number | string;
}

export const VirtualList: React.FC<VirtualListProps> = ({
  items,
  itemHeight,
  renderItem,
  overscan = 5,
  height = '100%',
  width = '100%',
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Calculate total height of all items
  const totalHeight = items.length * itemHeight;

  // Handle scroll event with throttling for performance
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    // Use requestAnimationFrame to throttle scroll events
    requestAnimationFrame(() => {
      setScrollTop(e.currentTarget.scrollTop);
    });
  }, []);

  // Calculate visible range of items
  const visibleRange = useMemo(() => {
    if (!containerRef.current) {
      return { startIndex: 0, endIndex: overscan * 2 };
    }

    const containerHeight = containerRef.current.clientHeight;
    
    // Calculate visible indices
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, items.length, itemHeight, overscan]);

  // Render only visible items
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    const visibleItems = [];

    for (let i = startIndex; i <= endIndex; i++) {
      if (i >= 0 && i < items.length) {
        visibleItems.push({
          item: items[i],
          index: i,
          style: {
            position: 'absolute',
            top: i * itemHeight,
            height: itemHeight,
            left: 0,
            right: 0,
          },
        });
      }
    }

    return visibleItems;
  }, [visibleRange, items, itemHeight]);

  return (
    <Box
      ref={containerRef}
      height={height}
      width={width}
      overflow="auto"
      position="relative"
      onScroll={handleScroll}
      role="list"
      aria-label="Virtual scrolling list"
      {...rest}
    >
      {/* Spacer to maintain scroll area */}
      <Box height={`${totalHeight}px`} position="relative" aria-hidden="true">
        {/* Render only visible items */}
        {visibleItems.map(({ item, index, style }) => (
          <Box 
            key={index} 
            style={style} 
            role="listitem"
            aria-posinset={index + 1} 
            aria-setsize={items.length}
          >
            {renderItem(item, index)}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default VirtualList;
