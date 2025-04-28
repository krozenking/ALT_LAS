import React, { memo } from 'react';
import { Box, BoxProps, useColorMode } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';
import { animations } from '@/styles/animations';

export interface ButtonProps extends BoxProps {
  variant?: 'glass' | 'glass-primary' | 'glass-secondary' | 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  'aria-label'?: string; // Add aria-label prop for accessibility
}

// Custom comparison function for memoization
const areEqual = (prevProps: ButtonProps, nextProps: ButtonProps) => {
  // Compare primitive props
  if (
    prevProps.variant !== nextProps.variant ||
    prevProps.size !== nextProps.size ||
    prevProps.isDisabled !== nextProps.isDisabled ||
    prevProps.isLoading !== nextProps.isLoading ||
    prevProps.onClick !== nextProps.onClick ||
    prevProps['aria-label'] !== nextProps['aria-label'] ||
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

  // Deep comparison is expensive, so we'll assume icons changed if they're provided
  // This is a trade-off between performance and correctness
  if (
    (prevProps.leftIcon && !nextProps.leftIcon) ||
    (!prevProps.leftIcon && nextProps.leftIcon) ||
    (prevProps.rightIcon && !nextProps.rightIcon) ||
    (!prevProps.rightIcon && nextProps.rightIcon)
  ) {
    return false;
  }

  // If we got here, props are considered equal
  return true;
};

export const Button: React.FC<ButtonProps> = memo(({
  variant = 'glass',
  size = 'md',
  isDisabled = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  onClick,
  children,
  'aria-label': ariaLabel, // Destructure aria-label
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
        bg: colorMode === 'light' ? 'primary.500' : 'primary.400',
        color: 'white',
      };
    } else if (variant === 'outline') {
      return {
        bg: 'transparent',
        border: '1px solid',
        borderColor: colorMode === 'light' ? 'primary.500' : 'primary.400',
        color: colorMode === 'light' ? 'primary.500' : 'primary.400',
      };
    }

    return {};
  };

  // Size styles - memoized to prevent recalculation
  const getSizeStyle = React.useMemo(() => {
    switch (size) {
      case 'sm':
        return { px: 3, py: 1, fontSize: 'sm' };
      case 'lg':
        return { px: 6, py: 3, fontSize: 'lg' };
      case 'md':
      default:
        return { px: 4, py: 2, fontSize: 'md' };
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

  // Loading styles with GPU-accelerated animation - memoized to prevent recalculation
  const loadingStyle = React.useMemo(() => isLoading ? {
    position: 'relative',
    cursor: 'progress',
    _before: {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate3d(-50%, -50%, 0)', // GPU-accelerated transform
      width: '1em',
      height: '1em',
      borderRadius: '50%',
      border: '2px solid',
      borderColor: 'currentColor',
      borderTopColor: 'transparent',
      animation: `${animations.keyframes.spin} 0.8s linear infinite`,
      willChange: 'transform', // Hint for browser optimization
    },
    _focus: { boxShadow: 'none' }, // Prevent focus ring on loading
  } : {}, [isLoading]);

  // Determine aria-label: Use provided label, or children if it's a string, otherwise undefined
  const finalAriaLabel = React.useMemo(() => 
    ariaLabel || (typeof children === 'string' ? children : 'Button'), // Always provide a label for screen readers
    [ariaLabel, children]
  );

  // Improved focus styles for better visibility (WCAG 2.1 AA compliance) - memoized
  const focusStyles = React.useMemo(() => !isDisabled && !isLoading ? {
    outline: 'none', // Remove default outline
    boxShadow: `0 0 0 3px ${colorMode === 'light' ? 'rgba(66, 153, 225, 0.6)' : 'rgba(99, 179, 237, 0.6)'}`, // Higher contrast focus ring
    zIndex: 1, // Ensure focus style is visible
  } : {}, [isDisabled, isLoading, colorMode]);

  // Memoize glass style to prevent recalculation on every render
  const glassStyle = React.useMemo(() => getGlassStyle(), [variant, colorMode]);

  // Memoize hover and active styles with GPU acceleration
  const interactionStyles = React.useMemo(() => {
    // If user prefers reduced motion, use simpler animations or none
    if (prefersReducedMotion) {
      return {
        _hover: !isDisabled && !isLoading ? {
          filter: 'brightness(1.05)',
        } : {},
        _active: !isDisabled && !isLoading ? {
          filter: 'brightness(0.95)',
        } : {},
      };
    }
    
    // Use GPU-accelerated animations for standard experience
    return {
      _hover: !isDisabled && !isLoading ? {
        transform: 'translate3d(0, -2px, 0)', // GPU-accelerated transform
        boxShadow: 'md',
        transition: animations.createAdaptiveTransition(['transform', 'box-shadow'], 'fast', animations.easings.easeOut),
      } : {},
      _active: !isDisabled && !isLoading ? {
        transform: 'translate3d(0, 0, 0)', // GPU-accelerated transform
        transition: animations.createAdaptiveTransition('transform', 'ultraFast', animations.easings.easeOut),
      } : {},
    };
  }, [isDisabled, isLoading, prefersReducedMotion]);

  // Apply GPU acceleration utilities
  const gpuAcceleration = animations.performanceUtils.forceGPU;

  return (
    <Box
      as="button"
      role="button" // Explicitly set role for clarity
      type="button" // Explicitly set type for accessibility
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="md"
      fontWeight="medium"
      transition={animations.createAdaptiveTransition(['transform', 'box-shadow', 'background', 'opacity'], 'normal', animations.easings.easeOut)}
      position="relative" // Ensure position context for focus styles
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
      {...loadingStyle}
      {...gpuAcceleration} // Apply GPU acceleration
      onClick={!isDisabled && !isLoading ? onClick : undefined}
      aria-disabled={isDisabled}
      aria-busy={isLoading}
      aria-label={finalAriaLabel} // Add computed aria-label
      data-focus-visible-added // Support for focus-visible polyfill
      tabIndex={isDisabled ? -1 : 0} // Ensure proper tab order
      {...rest}
    >
      {leftIcon && (
        <Box mr={children ? 2 : 0} display="inline-flex" alignItems="center" aria-hidden="true">
          {leftIcon}
        </Box>
      )}
      {isLoading ? <Box opacity={0}>{children}</Box> : children}
      {rightIcon && (
        <Box ml={children ? 2 : 0} display="inline-flex" alignItems="center" aria-hidden="true">
          {rightIcon}
        </Box>
      )}
    </Box>
  );
}, areEqual);

// Display name for debugging
Button.displayName = 'Button';

export default Button;
