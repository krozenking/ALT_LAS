import React, { useId, memo, useMemo, useCallback } from 'react';
import { Box, BoxProps, useColorMode, Heading } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';
import { animations } from '@/styles/animations'; // Import animations

export interface CardProps extends BoxProps {
  variant?: 'glass' | 'glass-primary' | 'glass-secondary' | 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  isInteractive?: boolean; // Can be clicked
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: (e: React.MouseEvent | React.KeyboardEvent) => void;
  headerProps?: BoxProps;
  bodyProps?: BoxProps;
  footerProps?: BoxProps;
  headerLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  isHoverable?: boolean; // Apply hover effects
  role?: string; // Allow overriding the default role
  isFocusable?: boolean; // Add prop to make card focusable
  'aria-label'?: string; // Explicit aria-label for accessibility
}

// Custom comparison function for memoization
const areEqual = (prevProps: CardProps, nextProps: CardProps) => {
  // Compare primitive props
  if (
    prevProps.variant !== nextProps.variant ||
    prevProps.size !== nextProps.size ||
    prevProps.isDisabled !== nextProps.isDisabled ||
    prevProps.isInteractive !== nextProps.isInteractive ||
    prevProps.onClick !== nextProps.onClick ||
    prevProps.children !== nextProps.children ||
    prevProps.headerLevel !== nextProps.headerLevel ||
    prevProps.isHoverable !== nextProps.isHoverable ||
    prevProps.role !== nextProps.role ||
    prevProps.isFocusable !== nextProps.isFocusable ||
    prevProps['aria-label'] !== nextProps['aria-label']
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

  // Assume complex props changed if they're provided (shallow compare)
  if (
    (prevProps.header && !nextProps.header) ||
    (!prevProps.header && nextProps.header) ||
    (prevProps.footer && !nextProps.footer) ||
    (!prevProps.footer && nextProps.footer)
  ) {
    return false;
  }

  // If we got here, props are considered equal
  return true;
};

export const Card: React.FC<CardProps> = memo(({
  variant = 'glass',
  size = 'md',
  isDisabled = false,
  isInteractive = false,
  header,
  footer,
  onClick,
  children,
  headerProps,
  bodyProps,
  footerProps,
  headerLevel = 'h3', // Default header level
  isHoverable = true, // Default hoverable
  role: customRole, // Rename to avoid conflict with internal role variable
  isFocusable = false, // Default to not focusable
  'aria-label': ariaLabel, // Destructure aria-label
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const prefersReducedMotion = animations.performanceUtils.prefersReducedMotion();
  const headerId = useId();
  const contentId = useId();

  // Apply glassmorphism effect based on color mode and variant
  const getCardStyle = useCallback(() => {
    if (variant === 'glass') {
      return colorMode === 'light'
        ? glassmorphism.create(0.7, 8, 1)
        : glassmorphism.createDark(0.7, 8, 1);
    } else if (variant === 'glass-primary') {
      return {
        ...(colorMode === 'light'
          ? glassmorphism.create(0.7, 8, 1)
          : glassmorphism.createDark(0.7, 8, 1)),
        bg: colorMode === 'light'
          ? 'rgba(62, 92, 118, 0.8)'
          : 'rgba(62, 92, 118, 0.6)',
        color: 'white',
      };
    } else if (variant === 'glass-secondary') {
      return {
        ...(colorMode === 'light'
          ? glassmorphism.create(0.7, 8, 1)
          : glassmorphism.createDark(0.7, 8, 1)),
        bg: colorMode === 'light'
          ? 'rgba(199, 144, 96, 0.8)'
          : 'rgba(199, 144, 96, 0.6)',
        color: 'white',
      };
    } else if (variant === 'solid') {
      return {
        bg: colorMode === 'light' ? 'white' : 'gray.700',
        color: colorMode === 'light' ? 'gray.800' : 'white',
        boxShadow: 'md',
      };
    } else if (variant === 'outline') {
      return {
        bg: 'transparent',
        border: '1px solid',
        borderColor: colorMode === 'light' ? 'gray.200' : 'gray.600',
        color: colorMode === 'light' ? 'gray.800' : 'white',
      };
    }

    return {};
  }, [variant, colorMode]);

  // Size styles - memoized
  const sizeStyle = useMemo(() => {
    switch (size) {
      case 'sm':
        return { p: 3 };
      case 'lg':
        return { p: 6 };
      case 'md':
      default:
        return { p: 4 };
    }
  }, [size]);

  // Disabled styles - memoized
  const disabledStyle = useMemo(() => isDisabled ? {
    opacity: 0.6,
    cursor: 'not-allowed',
    _hover: {},
    _active: {},
    _focus: { boxShadow: 'none' }, // Prevent focus ring on disabled
  } : {}, [isDisabled]);

  // Improved focus styles for better visibility (WCAG 2.1 AA compliance) - memoized
  const focusStyles = useMemo(() => !isDisabled && isFocusable ? {
    outline: 'none', // Remove default outline
    boxShadow: `0 0 0 3px ${colorMode === 'light' ? 'rgba(66, 153, 225, 0.6)' : 'rgba(99, 179, 237, 0.6)'}`, // Higher contrast focus ring
    zIndex: 1, // Ensure focus style is visible
  } : {}, [isDisabled, isFocusable, colorMode]);

  // Memoize card style to prevent recalculation on every render
  const cardStyle = useMemo(() => getCardStyle(), [getCardStyle]);

  // Memoize hover and active styles with GPU acceleration
  const interactionStyles = useMemo(() => {
    if (!(isInteractive || isHoverable) || isDisabled) {
      return {};
    }

    // If user prefers reduced motion, use simpler animations or none
    if (prefersReducedMotion) {
      return {
        cursor: isInteractive ? 'pointer' : 'default',
        _hover: {
          filter: 'brightness(1.05)',
        },
        _active: isInteractive ? {
          filter: 'brightness(0.95)',
        } : {},
      };
    }

    // Use GPU-accelerated animations for standard experience
    return {
      cursor: isInteractive ? 'pointer' : 'default',
      _hover: {
        transform: 'translate3d(0, -4px, 0)', // GPU-accelerated transform
        boxShadow: 'xl',
        transition: animations.createAdaptiveTransition(['transform', 'box-shadow'], 'normal', animations.easings.easeOut),
      },
      _active: isInteractive ? {
        transform: 'scale3d(0.98, 0.98, 1) translate3d(0, -2px, 0)', // GPU-accelerated transform
        transition: animations.createAdaptiveTransition('transform', 'fast', animations.easings.easeOut),
      } : {},
    };
  }, [isInteractive, isHoverable, isDisabled, prefersReducedMotion]);

  // Apply GPU acceleration utilities
  const gpuAcceleration = animations.performanceUtils.forceGPU;

  // Determine role
  const role = isInteractive ? 'button' : (customRole || 'region');

  // Determine aria attributes based on header presence and provided aria-label
  const ariaAttributes = useMemo(() => {
    // If an explicit aria-label is provided, use it
    if (ariaLabel) {
      return { 'aria-label': ariaLabel };
    }

    // If a header is present, use aria-labelledby
    if (header) {
      return { 'aria-labelledby': headerId };
    }

    // If neither is present and the card is focusable/interactive, warn in development
    if ((isFocusable || isInteractive) && !header && !ariaLabel && process.env.NODE_ENV !== 'production') {
      console.warn(
        `Warning: ${isInteractive ? 'Interactive' : 'Focusable'} Card should have either a header or an explicit 
        'aria-label' prop for accessibility.`
      );
    }

    return {};
  }, [ariaLabel, header, headerId, isFocusable, isInteractive]);

  // Handle click event with useCallback
  const handleClick = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    if (!isDisabled && isInteractive && onClick) {
      onClick(e);
    }
  }, [isDisabled, isInteractive, onClick]);

  // Handle keydown event for Enter/Space activation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isDisabled && isInteractive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleClick(e);
    }
  }, [isDisabled, isInteractive, handleClick]);

  return (
    <Box
      borderRadius="lg"
      overflow="hidden"
      transition={animations.createAdaptiveTransition(['transform', 'box-shadow', 'background', 'opacity'], 'normal', animations.easings.easeOut)}
      position="relative" // Ensure position context for focus styles
      tabIndex={(isInteractive || isFocusable) && !isDisabled ? 0 : undefined}
      role={role}
      aria-disabled={isDisabled}
      // Apply focus styles using _focusVisible for better keyboard navigation experience
      _focusVisible={{
        ...focusStyles
      }}
      {...interactionStyles}
      {...cardStyle}
      {...sizeStyle}
      {...disabledStyle}
      {...gpuAcceleration} // Apply GPU acceleration
      {...ariaAttributes} // Apply computed aria attributes
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {header && (
        <Box
          as="header"
          p={4}
          borderBottomWidth={1}
          borderColor={colorMode === 'light' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}
          {...headerProps}
        >
          {/* Render header content with proper semantics */}
          {typeof header === 'string' ? (
            <Heading as={headerLevel} size="md" id={headerId}>{header}</Heading>
          ) : (
            // If header is a complex node, ensure the primary text element within it gets the ID
            <Box id={headerId}>{header}</Box>
          )}
        </Box>
      )}

      <Box
        p={4}
        flex="1"
        className="card-content"
        id={contentId}
        {...bodyProps}
      >
        {children}
      </Box>

      {footer && (
        <Box
          as="footer"
          p={4}
          borderTopWidth={1}
          borderColor={colorMode === 'light' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}
          className="card-footer"
          {...footerProps}
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

