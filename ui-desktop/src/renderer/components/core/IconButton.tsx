import React, { memo } from 'react';
import { Box, BoxProps, useColorMode } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';

export interface IconButtonProps extends BoxProps {
  variant?: 'glass' | 'glass-primary' | 'glass-secondary' | 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  isLoading?: boolean;
  icon: React.ReactNode;
  ariaLabel: string; // Required ariaLabel prop
  onClick?: (e: React.MouseEvent) => void;
}

// Custom comparison function for memoization
const areEqual = (prevProps: IconButtonProps, nextProps: IconButtonProps) => {
  // Compare primitive props
  if (
    prevProps.variant !== nextProps.variant ||
    prevProps.size !== nextProps.size ||
    prevProps.isDisabled !== nextProps.isDisabled ||
    prevProps.isLoading !== nextProps.isLoading ||
    prevProps.onClick !== nextProps.onClick ||
    prevProps.ariaLabel !== nextProps.ariaLabel
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

  // Assume icon changed if provided
  if ((prevProps.icon && !nextProps.icon) || (!prevProps.icon && nextProps.icon)) {
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
  ariaLabel, // Use the provided ariaLabel
  onClick,
  ...rest
}) => {
  const { colorMode } = useColorMode();

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

  // Size styles - memoized
  const getSizeStyle = React.useMemo(() => {
    switch (size) {
      case 'sm':
        return {
          width: '32px',
          height: '32px',
          fontSize: 'sm'
        };
      case 'lg':
        return {
          width: '48px',
          height: '48px',
          fontSize: 'lg'
        };
      case 'md':
      default:
        return {
          width: '40px',
          height: '40px',
          fontSize: 'md'
        };
    }
  }, [size]);

  // Disabled styles - memoized
  const disabledStyle = React.useMemo(() => isDisabled ? {
    opacity: 0.6,
    cursor: 'not-allowed',
    _hover: {},
    _active: {},
    _focus: { boxShadow: 'none' }, // Prevent focus ring on disabled
  } : {}, [isDisabled]);

  // Loading styles - memoized
  const loadingStyle = React.useMemo(() => isLoading ? {
    position: 'relative',
    cursor: 'progress',
    _before: {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '1em',
      height: '1em',
      borderRadius: '50%',
      border: '2px solid',
      borderColor: 'currentColor',
      borderTopColor: 'transparent',
      animation: 'spin 0.8s linear infinite',
    },
    _focus: { boxShadow: 'none' }, // Prevent focus ring on loading
  } : {}, [isLoading]);

  // Improved focus styles for better visibility (WCAG 2.1 AA compliance) - memoized
  const focusStyles = React.useMemo(() => !isDisabled && !isLoading ? {
    outline: 'none', // Remove default outline
    boxShadow: `0 0 0 3px ${colorMode === 'light' ? 'rgba(66, 153, 225, 0.6)' : 'rgba(99, 179, 237, 0.6)'}`, // Higher contrast focus ring
    zIndex: 1, // Ensure focus style is visible
  } : {}, [isDisabled, isLoading, colorMode]);

  // Memoize glass style
  const glassStyle = React.useMemo(() => getGlassStyle(), [variant, colorMode]);

  // Memoize interaction styles
  const interactionStyles = React.useMemo(() => ({
    _hover: !isDisabled && !isLoading ? {
      transform: 'translateY(-2px)',
      boxShadow: 'md',
    } : {},
    _active: !isDisabled && !isLoading ? {
      transform: 'translateY(0)',
    } : {},
  }), [isDisabled, isLoading]);

  return (
    <Box
      as="button"
      role="button" // Explicitly set role for clarity
      type="button" // Explicitly set type for accessibility
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="md"
      transition="all 0.2s ease-in-out"
      position="relative" // Ensure position context for focus styles
      aria-label={ariaLabel} // Use the mandatory ariaLabel prop
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
      onClick={!isDisabled && !isLoading ? onClick : undefined}
      aria-disabled={isDisabled}
      aria-busy={isLoading}
      data-focus-visible-added // Support for focus-visible polyfill
      tabIndex={isDisabled ? -1 : 0} // Ensure proper tab order
      {...rest}
    >
      {/* Wrap icon in a span for better accessibility structure */}
      {isLoading ? (
        <Box opacity={0} aria-hidden="true">{icon}</Box>
      ) : (
        <Box
          aria-hidden="true"
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
