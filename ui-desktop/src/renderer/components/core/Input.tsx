import React, { useId, memo } from 'react';
import { Box, BoxProps, useColorMode, Input as ChakraInput, InputProps as ChakraInputProps, FormLabel } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';

export interface InputProps extends Omit<ChakraInputProps, 'size'> {
  variant?: 'glass' | 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  isRequired?: boolean; // Add isRequired prop for accessibility
}

// Custom comparison function for memoization
const areEqual = (prevProps: InputProps, nextProps: InputProps) => {
  // Compare primitive props
  if (
    prevProps.variant !== nextProps.variant ||
    prevProps.size !== nextProps.size ||
    prevProps.label !== nextProps.label ||
    prevProps.error !== nextProps.error ||
    prevProps.isRequired !== nextProps.isRequired ||
    prevProps.isDisabled !== nextProps.isDisabled ||
    prevProps.value !== nextProps.value || // Compare value
    prevProps.placeholder !== nextProps.placeholder ||
    prevProps.onChange !== nextProps.onChange ||
    prevProps.onBlur !== nextProps.onBlur ||
    prevProps.onFocus !== nextProps.onFocus
  ) {
    return false;
  }

  // Compare style props that affect rendering
  const styleProps = ['bg', 'color', 'borderColor', 'boxShadow', 'opacity'];
  for (const prop of styleProps) {
    if (prevProps[prop] !== nextProps[prop]) {
      return false;
    }
  }

  // Assume elements changed if provided
  if (
    (prevProps.leftElement && !nextProps.leftElement) ||
    (!prevProps.leftElement && nextProps.leftElement) ||
    (prevProps.rightElement && !nextProps.rightElement) ||
    (!prevProps.rightElement && nextProps.rightElement)
  ) {
    return false;
  }

  // If we got here, props are considered equal
  return true;
};

export const Input: React.FC<InputProps> = memo(({
  variant = 'glass',
  size = 'md',
  label,
  error,
  leftElement,
  rightElement,
  isRequired = false, // Default isRequired to false
  isDisabled = false, // Add isDisabled prop
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;
  const labelId = label ? `${id}-label` : undefined;

  // Improved focus styles for better visibility (WCAG 2.1 AA compliance) - memoized
  const focusStyles = React.useMemo(() => !isDisabled ? {
    borderColor: 'primary.500',
    boxShadow: `0 0 0 3px ${colorMode === 'light' ? 'rgba(66, 153, 225, 0.6)' : 'rgba(99, 179, 237, 0.6)'}`, // Higher contrast focus ring
    zIndex: 1, // Ensure focus style is visible
  } : {}, [isDisabled, colorMode]);

  // Apply glassmorphism effect based on color mode and variant
  const getInputStyle = React.useMemo(() => {
    if (variant === 'glass') {
      return {
        ...(colorMode === 'light'
          ? glassmorphism.create(0.5, 8, 1)
          : glassmorphism.createDark(0.5, 8, 1)),
        _focus: { ...focusStyles },
        _focusVisible: { ...focusStyles },
      };
    } else if (variant === 'solid') {
      return {
        bg: colorMode === 'light' ? 'white' : 'gray.800',
        border: '1px solid',
        borderColor: colorMode === 'light' ? 'gray.200' : 'gray.700',
        _focus: { ...focusStyles },
        _focusVisible: { ...focusStyles },
      };
    } else if (variant === 'outline') {
      return {
        bg: 'transparent',
        border: '1px solid',
        borderColor: colorMode === 'light' ? 'gray.300' : 'gray.600',
        _focus: { ...focusStyles },
        _focusVisible: { ...focusStyles },
      };
    }

    return {};
  }, [variant, colorMode, focusStyles]);

  // Size styles - memoized
  const getSizeStyle = React.useMemo(() => {
    switch (size) {
      case 'sm':
        return { px: 3, py: 1, fontSize: 'sm', height: '32px' };
      case 'lg':
        return { px: 4, py: 2, fontSize: 'md', height: '48px' };
      case 'md':
      default:
        return { px: 4, py: 2, fontSize: 'md', height: '40px' };
    }
  }, [size]);

  // Error styles - memoized
  const errorStyle = React.useMemo(() => error ? {
    borderColor: 'error.500',
    _focus: {
      borderColor: 'error.500',
      boxShadow: `0 0 0 3px ${colorMode === 'light' ? 'rgba(229, 62, 62, 0.6)' : 'rgba(252, 129, 129, 0.6)'}`, // Error focus ring
    },
    _focusVisible: {
      borderColor: 'error.500',
      boxShadow: `0 0 0 3px ${colorMode === 'light' ? 'rgba(229, 62, 62, 0.6)' : 'rgba(252, 129, 129, 0.6)'}`, // Error focus ring
    }
  } : {}, [error, colorMode]);

  // Disabled styles - memoized
  const disabledStyle = React.useMemo(() => isDisabled ? {
    opacity: 0.6,
    cursor: 'not-allowed',
    bg: colorMode === 'light' ? 'gray.100' : 'gray.700',
    borderColor: colorMode === 'light' ? 'gray.200' : 'gray.600',
    _focus: { boxShadow: 'none' },
    _focusVisible: { boxShadow: 'none' },
  } : {}, [isDisabled, colorMode]);

  return (
    <Box width="100%">
      {/* Label */}
      {label && (
        <FormLabel
          htmlFor={id}
          id={labelId}
          fontSize="sm"
          fontWeight="medium"
          mb={1}
          display="block"
          color={isDisabled ? (colorMode === 'light' ? 'gray.400' : 'gray.500') : (colorMode === 'light' ? 'gray.700' : 'gray.300')}
        >
          {label}{isRequired && <Box as="span" color="red.500" ml={1} aria-hidden="true">*</Box>}
        </FormLabel>
      )}

      {/* Input Container */}
      <Box position="relative" width="100%">
        {/* Left Element */}
        {leftElement && (
          <Box
            position="absolute"
            left={2}
            top="50%"
            transform="translateY(-50%)"
            zIndex={2}
            display="flex"
            alignItems="center"
            color={isDisabled ? (colorMode === 'light' ? 'gray.400' : 'gray.500') : 'inherit'}
            aria-hidden="true" // Hide decorative element from screen readers
          >
            {leftElement}
          </Box>
        )}

        {/* Input */}
        <ChakraInput
          width="100%"
          borderRadius="md"
          transition="all 0.2s ease-in-out"
          pl={leftElement ? 10 : 4}
          pr={rightElement ? 10 : 4}
          {...getInputStyle}
          {...getSizeStyle}
          {...errorStyle}
          {...disabledStyle} // Apply disabled styles
          id={id}
          isDisabled={isDisabled} // Pass isDisabled to ChakraInput
          isRequired={isRequired} // Pass isRequired to ChakraInput
          aria-invalid={!!error}
          aria-required={isRequired} // Explicitly set aria-required
          aria-describedby={errorId}
          aria-labelledby={label ? labelId : undefined} // Associate label if exists
          data-focus-visible-added // Support for focus-visible polyfill
          {...rest}
        />

        {/* Right Element */}
        {rightElement && (
          <Box
            position="absolute"
            right={2}
            top="50%"
            transform="translateY(-50%)"
            zIndex={2}
            display="flex"
            alignItems="center"
            color={isDisabled ? (colorMode === 'light' ? 'gray.400' : 'gray.500') : 'inherit'}
            aria-hidden="true" // Hide decorative element from screen readers
          >
            {rightElement}
          </Box>
        )}
      </Box>

      {/* Error Message */}
      {error && (
        <Box
          id={errorId}
          mt={1}
          fontSize="sm"
          color="error.500"
          role="alert" // Add role alert for error messages
          aria-live="assertive" // Ensure screen readers announce the error
        >
          {error}
        </Box>
      )}
    </Box>
  );
}, areEqual);

// Display name for debugging
Input.displayName = 'Input';

export default Input;
