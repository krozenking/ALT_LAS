import React, { memo, useMemo, useEffect, useCallback } from 'react';
import { Box, BoxProps, useColorMode } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';
import { animations } from '@/styles/animations'; // Import animations

export interface IconButtonProps extends BoxProps {
  variant?: 'glass' | 'glass-primary' | 'glass-secondary' | 'solid' | 'outline' | 'high-contrast' | 'high-contrast-secondary';
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  isLoading?: boolean;
  icon: React.ReactElement; // Use React.ReactElement for icon
  onClick?: (e: React.MouseEvent | React.KeyboardEvent) => void; // Allow keyboard events
  'aria-label': string; // Required for accessibility
}

// Custom comparison function for memoization to optimize performance
const areEqual = (prevProps: IconButtonProps, nextProps: IconButtonProps) => {
  // Compare primitive props
  if (
    prevProps.variant !== nextProps.variant ||
    prevProps.size !== nextProps.size ||
    prevProps.isDisabled !== nextProps.isDisabled ||
    prevProps.isLoading !== nextProps.isLoading ||
    prevProps.onClick !== nextProps.onClick ||
    prevProps['aria-label'] !== nextProps['aria-label'] // Compare 'aria-label'
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

  // Shallow compare icon element type
  if (prevProps.icon?.type !== nextProps.icon?.type) {
    return false;
  }

  // If we got here, props are considered equal
  return true;
};

export const IconButton: React.FC<IconButtonProps> = memo(({
  variant = 'glass',
  size = 'md',
  isDisabled = false,
  isLoading = false,
  icon,
  onClick,
  'aria-label': ariaLabel, // Destructure 'aria-label'
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const prefersReducedMotion = animations.performanceUtils.prefersReducedMotion();

  // Validate ariaLabel in development
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && (!ariaLabel || ariaLabel.trim() === '')) {
      console.error('IconButton requires a non-empty aria-label prop for accessibility');
    }
  }, [ariaLabel]);

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
    }

    return {};
  }, [variant, colorMode]);

  // Size styles - memoized
  const sizeStyle = useMemo(() => {
    switch (size) {
      case 'sm':
        return { boxSize: 8, fontSize: 'md' };
      case 'lg':
        return { boxSize: 12, fontSize: 'xl' };
      case 'md':
      default:
        return { boxSize: 10, fontSize: 'lg' };
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

  // Loading styles with GPU-accelerated animation - memoized
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

  // Improved focus styles for better visibility (WCAG 2.1 AA compliance) - memoized
  const focusStyles = useMemo(() => !isDisabled && !isLoading ? {
    outline: 'none', // Remove default outline
    boxShadow: `0 0 0 3px ${colorMode === 'light' ? 'rgba(66, 153, 225, 0.6)' : 'rgba(99, 179, 237, 0.6)'}`, // Higher contrast focus ring
    zIndex: 1, // Ensure focus style is visible
  } : {}, [isDisabled, isLoading, colorMode]);

  // Memoize variant style
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

  // Handle click event with useCallback
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
      aria-label={ariaLabel} // Use the mandatory aria-label prop
      // Apply focus styles using _focusVisible for better keyboard navigation experience
      _focusVisible={{
        ...focusStyles
      }}
      {...interactionStyles}
      {...variantStyle}
      {...sizeStyle}
      {...disabledStyle}
      {...loadingStyle}
      {...gpuAcceleration} // Apply GPU acceleration
      onClick={handleClick}
      onKeyDown={handleKeyDown} // Add keyboard handler
      // ARIA attributes for accessibility
      aria-disabled={isDisabled}
      aria-busy={isLoading}
      tabIndex={isDisabled ? -1 : 0} // Ensure proper tab order: disabled buttons are not focusable
      {...rest}
    >
      {/* Wrap icon in a span for better accessibility structure */}
      {isLoading ? (
        <Box opacity={0} aria-hidden="true">{icon}</Box>
      ) : (
        <Box
          aria-hidden="true" // Hide icon from screen readers as the button itself has an aria-label
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {icon}
        </Box>
      )}
    </Box>
  );
}, areEqual);

// Display name for debugging
IconButton.displayName = 'IconButton';

export default IconButton;

