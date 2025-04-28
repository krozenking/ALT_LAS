import React, { useId, memo } from 'react';
import { Box, BoxProps, useColorMode, Card as ChakraCard, CardHeader, CardBody, CardFooter } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';
import { animations } from '@/styles/animations'; // Import animations

export interface CardProps extends BoxProps {
  variant?: 'glass' | 'glass-primary' | 'glass-secondary' | 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  isInteractive?: boolean;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  headerProps?: BoxProps;
  bodyProps?: BoxProps;
  footerProps?: BoxProps;
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
    prevProps.children !== nextProps.children
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
  // This is a trade-off between performance and correctness
  if (
    (prevProps.title && !nextProps.title) ||
    (!prevProps.title && nextProps.title) ||
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
  title,
  footer,
  onClick,
  children,
  headerProps,
  bodyProps,
  footerProps,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const prefersReducedMotion = animations.performanceUtils.prefersReducedMotion();

  // Apply glassmorphism effect based on color mode and variant
  const getGlassStyle = () => {
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
  };

  // Size styles - memoized to prevent recalculation
  const getSizeStyle = React.useMemo(() => {
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

  // Disabled styles - memoized to prevent recalculation
  const disabledStyle = React.useMemo(() => isDisabled ? {
    opacity: 0.6,
    cursor: 'not-allowed',
    _hover: {},
    _active: {},
    _focus: { boxShadow: 'none' }, // Prevent focus ring on disabled
  } : {}, [isDisabled]);

  // Improved focus styles for better visibility (WCAG 2.1 AA compliance) - memoized
  const focusStyles = React.useMemo(() => !isDisabled && isInteractive ? {
    outline: 'none', // Remove default outline
    boxShadow: `0 0 0 3px ${colorMode === 'light' ? 'rgba(66, 153, 225, 0.6)' : 'rgba(99, 179, 237, 0.6)'}`, // Higher contrast focus ring
    zIndex: 1, // Ensure focus style is visible
  } : {}, [isDisabled, isInteractive, colorMode]);

  // Memoize glass style to prevent recalculation on every render
  const glassStyle = React.useMemo(() => getGlassStyle(), [variant, colorMode]);

  // Memoize hover and active styles with GPU acceleration
  const interactionStyles = React.useMemo(() => {
    if (!isInteractive || isDisabled) {
      return {};
    }

    // If user prefers reduced motion, use simpler animations or none
    if (prefersReducedMotion) {
      return {
        cursor: 'pointer',
        _hover: {
          filter: 'brightness(1.05)',
        },
        _active: {
          filter: 'brightness(0.95)',
        },
      };
    }
    
    // Use GPU-accelerated animations for standard experience
    return {
      cursor: 'pointer',
      _hover: {
        transform: 'translate3d(0, -4px, 0)', // GPU-accelerated transform
        boxShadow: 'xl',
        transition: animations.createAdaptiveTransition(['transform', 'box-shadow'], 'normal', animations.easings.easeOut),
      },
      _active: {
        transform: 'scale3d(0.98, 0.98, 1) translate3d(0, -2px, 0)', // GPU-accelerated transform
        transition: animations.createAdaptiveTransition('transform', 'fast', animations.easings.easeOut),
      },
    };
  }, [isInteractive, isDisabled, prefersReducedMotion]);

  // Apply GPU acceleration utilities
  const gpuAcceleration = animations.performanceUtils.forceGPU;

  return (
    <Box
      borderRadius="lg"
      overflow="hidden"
      transition={animations.createAdaptiveTransition(['transform', 'box-shadow', 'background', 'opacity'], 'normal', animations.easings.easeOut)}
      position="relative" // Ensure position context for focus styles
      tabIndex={isInteractive && !isDisabled ? 0 : undefined}
      role={isInteractive ? 'button' : undefined}
      aria-disabled={isDisabled}
      _focus={{
        ...focusStyles
      }}
      _focusVisible={{
        ...focusStyles
      }}
      {...interactionStyles}
      {...glassStyle}
      {...getSizeStyle}
      {...disabledStyle}
      {...gpuAcceleration} // Apply GPU acceleration
      onClick={isInteractive && !isDisabled ? onClick : undefined}
      onKeyDown={isInteractive && !isDisabled ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(e as any);
        }
      } : undefined}
      {...rest}
    >
      {title && (
        <Box 
          as="header" 
          p={4} 
          borderBottomWidth={1}
          {...headerProps}
        >
          {title}
        </Box>
      )}
      
      <Box 
        p={4}
        {...bodyProps}
      >
        {children}
      </Box>
      
      {footer && (
        <Box 
          as="footer" 
          p={4} 
          borderTopWidth={1}
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
