import React, { memo, useState, useCallback, useMemo } from 'react';
import { Box, BoxProps, useColorMode } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';
import { animations } from '@/styles/animations';

export interface ButtonProps extends BoxProps {
  variant?: 'glass' | 'glass-primary' | 'glass-secondary' | 'solid' | 'outline' | 'high-contrast' | 'high-contrast-secondary' | 'high-contrast-outline';
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: (e: React.MouseEvent | React.KeyboardEvent) => void; // Allow keyboard events
  /**
   * Accessible label for the button when the content is not descriptive enough
   * or for icon-only buttons.
   */
  'aria-label'?: string;
}

// Custom comparison function for memoization to optimize performance
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

  // Shallow compare icons - assumes change if presence changes
  if (
    (prevProps.leftIcon && !nextProps.leftIcon) ||
    (!prevProps.leftIcon && nextProps.leftIcon) ||
    (prevProps.rightIcon && !nextProps.rightIcon) ||
    (!prevProps.rightIcon && nextProps.rightIcon)
  ) {
    return false;
  }

  return true;
};

export const Button: React.FC<ButtonProps> = memo(({
  variant = 'glass',
  size = 'md',
  isDisabled = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  onClick,
  'aria-label': ariaLabel, // Destructure aria-label
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const prefersReducedMotion = animations.performanceUtils.prefersReducedMotion();

  // Apply glassmorphism effect based on color mode and variant
  const getVariantStyle = useCallback(() => {
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
    } else if (variant === 'high-contrast') {
      return {
        bg: colorMode === 'light'
          ? 'highContrast.light.primary'
          : 'highContrast.dark.primary',
        color: colorMode === 'light'
          ? 'white'
          : 'black',
        border: '2px solid',
        borderColor: colorMode === 'light'
          ? 'black'
          : 'white',
      };
    } else if (variant === 'high-contrast-secondary') {
      return {
        bg: colorMode === 'light'
          ? 'highContrast.light.secondary'
          : 'highContrast.dark.secondary',
        color: colorMode === 'light'
          ? 'white'
          : 'black',
        border: '2px solid',
        borderColor: colorMode === 'light'
          ? 'black'
          : 'white',
      };
    } else if (variant === 'high-contrast-outline') {
      return {
        bg: 'transparent',
        color: colorMode === 'light'
          ? 'highContrast.light.text'
          : 'highContrast.dark.text',
        border: '3px solid',
        borderColor: colorMode === 'light'
          ? 'highContrast.light.primary'
          : 'highContrast.dark.primary',
      };
    }

    return {};
  }, [variant, colorMode]);

  // Size styles - memoized to prevent recalculation
  const getSizeStyle = useMemo(() => {
    switch (size) {
      case 'sm':
        return {
          px: 3,
          py: 1,
          fontSize: 'sm',
          height: '32px',
        };
      case 'lg':
        return {
          px: 6,
          py: 3,
          fontSize: 'lg',
          height: '48px',
        };
      case 'md':
      default:
        return {
          px: 4,
          py: 2,
          fontSize: 'md',
          height: '40px',
        };
    }
  }, [size]);

  // Disabled styles - memoized to prevent recalculation
  const disabledStyle = useMemo(() => isDisabled ? {
    opacity: 0.6,
    cursor: 'not-allowed',
    _hover: {},
    _active: {},
    _focus: { boxShadow: 'none' }, // Prevent focus ring on disabled
  } : {}, [isDisabled]);

  // Loading styles with GPU-accelerated animation - memoized to prevent recalculation
  const loadingStyle = useMemo(() => isLoading ? {
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

  // Determine aria-label: Use provided label, or children if it's a string.
  // Warn in development if an icon-only button lacks an explicit aria-label.
  const finalAriaLabel = useMemo(() => {
    if (ariaLabel) {
      return ariaLabel;
    }
    if (typeof children === 'string') {
      return children;
    }
    // For icon-only buttons, an explicit aria-label is crucial.
    if ((leftIcon || rightIcon) && !children) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          'Warning: Icon-only button should have an explicit `aria-label` prop for accessibility.'
        );
      }
      return 'Button'; // Provide a fallback, but warn.
    }
    return undefined; // Let the browser handle it if there's text content
  }, [ariaLabel, children, leftIcon, rightIcon]);

  // Improved focus styles for better visibility (WCAG 2.1 AA compliance) - memoized
  // Ensure focus ring color has sufficient contrast against button backgrounds (WCAG 1.4.11)
  // This might need adjustment based on the specific theme colors.
  const focusStyles = useMemo(() => !isDisabled && !isLoading ? {
    outline: 'none', // Remove default outline
    boxShadow: `0 0 0 3px ${colorMode === 'light' ? 'rgba(66, 153, 225, 0.6)' : 'rgba(99, 179, 237, 0.6)'}`, // High-contrast focus ring
    zIndex: 1, // Ensure focus style is visible above other elements
  } : {}, [isDisabled, isLoading, colorMode]);

  // Memoize variant style to prevent recalculation on every render
  const variantStyle = useMemo(() => getVariantStyle(), [getVariantStyle]);

  // Memoize hover and active styles with GPU acceleration
  const interactionStyles = useMemo(() => {
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

  // Handle click event with useCallback to prevent recreation on every render
  const handleClick = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    if (!isDisabled && !isLoading && onClick) {
      onClick(e);
    }
  }, [isDisabled, isLoading, onClick]);

  // Handle keydown event for Enter/Space activation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isDisabled && !isLoading && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleClick(e);
    }
  }, [isDisabled, isLoading, handleClick]);

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
      // Apply focus styles using _focusVisible for better keyboard navigation experience
      _focusVisible={{
        ...focusStyles
      }}
      {...interactionStyles}
      {...variantStyle}
      {...getSizeStyle}
      {...disabledStyle}
      {...loadingStyle}
      {...gpuAcceleration} // Apply GPU acceleration
      onClick={handleClick}
      onKeyDown={handleKeyDown} // Add keyboard handler
      // ARIA attributes for accessibility
      aria-disabled={isDisabled}
      aria-busy={isLoading}
      aria-label={finalAriaLabel} // Computed aria-label
      tabIndex={isDisabled ? -1 : 0} // Ensure proper tab order: disabled buttons are not focusable
      {...rest}
    >
      {/* Hide icons from screen readers as the button itself should have a label */}
      {leftIcon && (
        <Box mr={children ? 2 : 0} display="inline-flex" alignItems="center" aria-hidden="true">
          {leftIcon}
        </Box>
      )}
      {/* Render children, but make them invisible during loading state */}
      {isLoading ? <Box as="span" opacity={0}>{children}</Box> : children}
      {/* Hide icons from screen readers */}
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

