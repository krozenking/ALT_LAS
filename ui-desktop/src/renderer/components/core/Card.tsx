import React, { useId, memo } from 'react';
import { Box, BoxProps, useColorMode, Heading } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';

export interface CardProps extends BoxProps {
  variant?: 'glass' | 'solid' | 'outline';
  header?: React.ReactNode;
  headerLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'; // Allow specifying header level
  footer?: React.ReactNode;
  isHoverable?: boolean;
  role?: string; // Allow overriding the default role
  isFocusable?: boolean; // Add prop to make card focusable
}

// Custom comparison function for memoization
const areEqual = (prevProps: CardProps, nextProps: CardProps) => {
  // Compare primitive props
  if (
    prevProps.variant !== nextProps.variant ||
    prevProps.headerLevel !== nextProps.headerLevel ||
    prevProps.isHoverable !== nextProps.isHoverable ||
    prevProps.role !== nextProps.role ||
    prevProps.isFocusable !== nextProps.isFocusable
  ) {
    return false;
  }

  // Compare style props that affect rendering
  const styleProps = ['bg', 'color', 'borderColor', 'boxShadow', 'opacity', 'transform'];
  for (const prop of styleProps) {
    if (prevProps[prop] !== nextProps[prop]) {
      return false;
    }
  }

  // Deep comparison is expensive, so we'll assume complex props changed if they're provided
  if (
    (prevProps.header && !nextProps.header) ||
    (!prevProps.header && nextProps.header) ||
    (prevProps.footer && !nextProps.footer) ||
    (!prevProps.footer && nextProps.footer) ||
    (prevProps.children && !nextProps.children) ||
    (!prevProps.children && nextProps.children)
  ) {
    return false;
  }

  // If we got here, props are considered equal
  return true;
};

export const Card: React.FC<CardProps> = memo(({
  variant = 'glass',
  header,
  headerLevel = 'h3', // Default header level
  footer,
  isHoverable = true,
  children,
  role = 'region', // Default role to region, suitable for landmark
  isFocusable = false, // Default to not focusable
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const headerId = useId();
  const contentId = useId();

  // Apply glassmorphism effect based on color mode and variant - memoized
  const getCardStyle = React.useMemo(() => {
    if (variant === 'glass') {
      return colorMode === 'light'
        ? glassmorphism.create(0.7, 10, 1)
        : glassmorphism.createDark(0.7, 10, 1);
    } else if (variant === 'solid') {
      return {
        bg: colorMode === 'light' ? 'white' : 'gray.800',
        boxShadow: 'md',
        borderRadius: 'md',
      };
    } else if (variant === 'outline') {
      return {
        bg: 'transparent',
        border: '1px solid',
        borderColor: colorMode === 'light' ? 'gray.200' : 'gray.700',
        borderRadius: 'md',
      };
    }

    return {};
  }, [variant, colorMode]);

  // Hover effect - memoized
  const hoverStyle = React.useMemo(() => isHoverable ? {
    _hover: {
      transform: 'translateY(-4px)',
      boxShadow: 'lg',
      transition: 'all 0.3s ease',
    }
  } : {}, [isHoverable]);

  // Improved focus styles for better visibility (WCAG 2.1 AA compliance) - memoized
  // Applied only if isFocusable is true
  const focusStyles = React.useMemo(() => isFocusable ? {
    outline: 'none', // Remove default outline
    boxShadow: `0 0 0 3px ${colorMode === 'light' ? 'rgba(66, 153, 225, 0.6)' : 'rgba(99, 179, 237, 0.6)'}`, // Higher contrast focus ring
    zIndex: 1, // Ensure focus style is visible
  } : {}, [isFocusable, colorMode]);

  // Determine aria-labelledby based on header presence
  const ariaLabelledBy = header ? headerId : undefined;

  return (
    <Box
      display="flex"
      flexDirection="column"
      overflow="hidden"
      transition="all 0.2s ease-in-out"
      position="relative" // Ensure position context for focus styles
      {...getCardStyle}
      {...hoverStyle}
      _focus={{
        ...focusStyles
      }}
      _focusVisible={{
        ...focusStyles
      }}
      role={role} // Apply role
      aria-labelledby={ariaLabelledBy} // Label by header if exists
      // aria-describedby={contentId} // Describe by content - removed as content might be complex and not suitable for description
      tabIndex={isFocusable ? 0 : undefined} // Make focusable if needed
      data-focus-visible-added // Support for focus-visible polyfill
      {...rest}
    >
      {/* Card Header */}
      {header && (
        <Box
          p={4}
          borderBottom="1px solid"
          borderColor={colorMode === 'light' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}
          className="card-header"
        >
          {/* Render header content, ensuring it has the correct ID */} 
          {typeof header === 'string' ? (
            <Heading as={headerLevel} size="md" id={headerId}>{header}</Heading>
          ) : (
            // If header is a complex node, ensure the primary text element within it gets the ID
            // For simplicity, wrapping in a Box with ID. User should ensure semantic heading inside.
            <Box id={headerId}>{header}</Box> 
          )}
        </Box>
      )}

      {/* Card Content */}
      <Box
        p={4}
        flex="1"
        className="card-content"
        id={contentId} // Keep id for potential custom use, but removed from aria-describedby
      >
        {children}
      </Box>

      {/* Card Footer */}
      {footer && (
        <Box
          p={4}
          borderTop="1px solid"
          borderColor={colorMode === 'light' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}
          className="card-footer"
        >
          {footer}
        </Box>
      )}
    </Box>
  );
}, areEqual);

// Display name for debugging
Card.displayName = 'Card';

export default Card;
