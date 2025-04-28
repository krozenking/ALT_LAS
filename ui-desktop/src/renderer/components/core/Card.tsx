import React, { useId, memo, useMemo, useCallback } from 'react';
import { Box, BoxProps, useColorMode, Heading } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';
import { animations } from '@/styles/animations'; // Import animations

export interface CardProps extends BoxProps {
  variant?: 'glass' | 'glass-primary' | 'glass-secondary' | 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  isInteractive?: boolean; // Kept from HEAD, might be useful for click interactions
  header?: React.ReactNode; // Renamed from 'title' in HEAD to match 4d81c5c
  footer?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  headerProps?: BoxProps;
  bodyProps?: BoxProps;
  footerProps?: BoxProps;
  headerLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'; // From 4d81c5c
  isHoverable?: boolean; // From 4d81c5c (redundant with isInteractive? Keep for now)
  role?: string; // Allow overriding the default role (From 4d81c5c)
  isFocusable?: boolean; // Add prop to make card focusable (From 4d81c5c)
  'aria-label'?: string; // Explicit aria-label for accessibility (From 4d81c5c)
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

  // Deep comparison is expensive, so we'll assume complex props changed if they're provided
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
  headerLevel = 'h3', // Default header level (From 4d81c5c)
  isHoverable = true, // Default from 4d81c5c
  role = 'region', // Default role to region, suitable for landmark (From 4d81c5c)
  isFocusable = false, // Default to not focusable (From 4d81c5c)
  'aria-label': ariaLabel, // Destructure aria-label (From 4d81c5c)
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const prefersReducedMotion = animations.performanceUtils.prefersReducedMotion();
  const headerId = useId();
  const contentId = useId();

  // Apply glassmorphism effect based on color mode and variant (from HEAD, more detailed)
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

  // Size styles - memoized (from HEAD)
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

  // Disabled styles - memoized (from HEAD)
  const disabledStyle = useMemo(() => isDisabled ? {
    opacity: 0.6,
    cursor: 'not-allowed',
    _hover: {},
    _active: {},
    _focus: { boxShadow: 'none' }, // Prevent focus ring on disabled
  } : {}, [isDisabled]);

  // Improved focus styles for better visibility (WCAG 2.1 AA compliance) - memoized (from 4d81c5c, using isFocusable)
  const focusStyles = useMemo(() => !isDisabled && isFocusable ? {
    outline: 'none', // Remove default outline
    boxShadow: `0 0 0 3px ${colorMode === 'light' ? 'rgba(66, 153, 225, 0.6)' : 'rgba(99, 179, 237, 0.6)'}`, // Higher contrast focus ring
    zIndex: 1, // Ensure focus style is visible
  } : {}, [isDisabled, isFocusable, colorMode]);

  // Memoize card style to prevent recalculation on every render
  const cardStyle = useMemo(() => getCardStyle(), [getCardStyle]);

  // Memoize hover and active styles with GPU acceleration (from HEAD, using isHoverable/isInteractive)
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

  // Apply GPU acceleration utilities (from HEAD)
  const gpuAcceleration = animations.performanceUtils.forceGPU;

  // Determine aria attributes based on header presence and provided aria-label (from 4d81c5c)
  const ariaAttributes = useMemo(() => {
    // If an explicit aria-label is provided, use it
    if (ariaLabel) {
      return { 'aria-label': ariaLabel };
    }

    // If a header is present, use aria-labelledby
    if (header) {
      return { 'aria-labelledby': headerId };
    }

    // If neither is present and the card is focusable, warn in development
    if (isFocusable && !header && !ariaLabel && process.env.NODE_ENV !== 'production') {
      console.warn(
        'Warning: Focusable Card should have either a header or an explicit `aria-label` prop for accessibility.'
      );
    }

    return {};
  }, [ariaLabel, header, headerId, isFocusable]);

  return (
    <Box
      borderRadius="lg"
      overflow="hidden"
      transition={animations.createAdaptiveTransition(['transform', 'box-shadow', 'background', 'opacity'], 'normal', animations.easings.easeOut)}
      position="relative" // Ensure position context for focus styles
      tabIndex={(isInteractive || isFocusable) && !isDisabled ? 0 : undefined}
      role={isInteractive ? 'button' : role} // Use 'button' if interactive, otherwise use role from props (default 'region')
      aria-disabled={isDisabled}
      // Apply focus styles using _focusVisible for better keyboard navigation experience (from 4d81c5c)
      _focusVisible={{
        ...focusStyles
      }}
      {...interactionStyles} // From HEAD
      {...cardStyle} // Merged from getGlassStyle/getCardStyle
      {...sizeStyle} // From HEAD
      {...disabledStyle} // From HEAD
      {...gpuAcceleration} // Apply GPU acceleration (from HEAD)
      {...ariaAttributes} // Apply computed aria attributes (from 4d81c5c)
      onClick={isInteractive && !isDisabled ? onClick : undefined} // From HEAD
      onKeyDown={isInteractive && !isDisabled ? (e) => { // From HEAD
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(e as any);
        }
      } : undefined}
      {...rest}
    >
      {header && (
        <Box
          as="header"
          p={4}
          borderBottomWidth={1}
          borderColor={colorMode === 'light' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'} // Style from 4d81c5c
          {...headerProps}
        >
          {/* Render header content with proper semantics (from 4d81c5c) */}
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
        flex="1" // From 4d81c5c
        className="card-content" // From 4d81c5c
        id={contentId} // From 4d81c5c
        {...bodyProps}
      >
        {children}
      </Box>

      {footer && (
        <Box
          as="footer"
          p={4}
          borderTopWidth={1}
          borderColor={colorMode === 'light' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'} // Style from 4d81c5c
          className="card-footer" // From 4d81c5c
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
