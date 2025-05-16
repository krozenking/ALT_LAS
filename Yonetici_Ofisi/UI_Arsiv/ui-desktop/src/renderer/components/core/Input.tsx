import React, { useId, memo, useMemo, useEffect, useCallback } from 'react';
import {
  Box, BoxProps, useColorMode, Input as ChakraInput, InputProps as ChakraInputProps,
  FormLabel, FormHelperText, FormErrorMessage, FormControl
} from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';
import { animations } from '@/styles/animations'; // Import animations

// Combine props from both versions, prioritizing the FormControl structure
export interface InputProps extends BoxProps {
  variant?: 'glass' | 'glass-primary' | 'glass-secondary' | 'solid' | 'outline' | 'high-contrast'; // Added high-contrast
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  label?: string;
  placeholder?: string;
  helperText?: string; // Use helperText instead of description
  errorMessage?: string; // Use errorMessage instead of error
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  type?: string;
  name?: string;
  id?: string; // Allow external ID override
  autoComplete?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

// Custom comparison function for memoization
const areEqual = (prevProps: InputProps, nextProps: InputProps) => {
  // Compare primitive props
  if (
    prevProps.variant !== nextProps.variant ||
    prevProps.size !== nextProps.size ||
    prevProps.isDisabled !== nextProps.isDisabled ||
    prevProps.isReadOnly !== nextProps.isReadOnly ||
    prevProps.isInvalid !== nextProps.isInvalid ||
    prevProps.isRequired !== nextProps.isRequired ||
    prevProps.label !== nextProps.label ||
    prevProps.placeholder !== nextProps.placeholder ||
    prevProps.helperText !== nextProps.helperText ||
    prevProps.errorMessage !== nextProps.errorMessage ||
    prevProps.value !== nextProps.value ||
    prevProps.onChange !== nextProps.onChange ||
    prevProps.onFocus !== nextProps.onFocus ||
    prevProps.onBlur !== nextProps.onBlur ||
    prevProps.type !== nextProps.type ||
    prevProps.name !== nextProps.name ||
    prevProps.id !== nextProps.id ||
    prevProps.autoComplete !== nextProps.autoComplete
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

  // Assume elements changed if they're provided (shallow compare)
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
  isDisabled = false,
  isReadOnly = false,
  isInvalid = false,
  isRequired = false,
  label,
  placeholder,
  helperText,
  errorMessage,
  value,
  onChange,
  onFocus,
  onBlur,
  type = 'text',
  name,
  id: propId, // Rename prop to avoid conflict with internal id
  autoComplete,
  leftElement,
  rightElement,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const generatedId = useId();
  const id = propId || `input-${generatedId}`;
  const errorId = isInvalid && errorMessage ? `${id}-error` : undefined;
  const helperId = helperText ? `${id}-helper` : undefined;
  const labelId = label ? `${id}-label` : undefined;
  const prefersReducedMotion = animations.performanceUtils.prefersReducedMotion();

  // Improved focus styles for better visibility (WCAG 2.1 AA compliance) - memoized
  const focusStyles = useMemo(() => !isDisabled ? {
    outline: 'none', // Remove default outline
    boxShadow: `0 0 0 3px ${colorMode === 'light' ? 'rgba(66, 153, 225, 0.6)' : 'rgba(99, 179, 237, 0.6)'}`, // Higher contrast focus ring
    borderColor: colorMode === 'light' ? 'blue.500' : 'blue.300',
    zIndex: 1, // Ensure focus style is visible
  } : {}, [isDisabled, colorMode]);

  // Apply glassmorphism effect based on color mode and variant
  const getVariantStyle = useCallback(() => {
    const baseFocusVisible = { _focusVisible: { ...focusStyles } }; // Use _focusVisible for keyboard focus

    if (variant === 'glass') {
      return {
        ...(colorMode === 'light'
          ? glassmorphism.create(0.7, 8, 1)
          : glassmorphism.createDark(0.7, 8, 1)),
        ...baseFocusVisible,
      };
    } else if (variant === 'glass-primary') {
      return {
        ...(colorMode === 'light'
          ? glassmorphism.create(0.7, 8, 1)
          : glassmorphism.createDark(0.7, 8, 1)),
        bg: colorMode === 'light'
          ? 'rgba(62, 92, 118, 0.8)'
          : 'rgba(62, 92, 118, 0.6)',
        color: 'white',
        ...baseFocusVisible,
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
        ...baseFocusVisible,
      };
    } else if (variant === 'solid') {
      return {
        bg: colorMode === 'light' ? 'white' : 'gray.700',
        color: colorMode === 'light' ? 'gray.800' : 'white',
        border: '1px solid',
        borderColor: colorMode === 'light' ? 'gray.200' : 'gray.700',
        ...baseFocusVisible,
      };
    } else if (variant === 'outline') {
      return {
        bg: 'transparent',
        border: '1px solid',
        borderColor: colorMode === 'light' ? 'gray.300' : 'gray.600',
        color: colorMode === 'light' ? 'gray.800' : 'white',
        ...baseFocusVisible,
      };
    } else if (variant === 'high-contrast') { // Added high-contrast variant
      return {
        border: '2px solid',
        borderColor: colorMode === 'light'
          ? 'highContrast.light.border'
          : 'highContrast.dark.border',
        bg: colorMode === 'light'
          ? 'white'
          : 'black',
        color: colorMode === 'light'
          ? 'black'
          : 'white',
        _hover: {
          borderColor: colorMode === 'light'
            ? 'highContrast.light.primary'
            : 'highContrast.dark.primary',
        },
        _focus: { // Use _focus for high-contrast as _focusVisible might not be enough
          borderColor: colorMode === 'light'
            ? 'highContrast.light.focus'
            : 'highContrast.dark.focus',
          boxShadow: 'high-contrast-focus',
          outline: 'none',
        },
        _focusVisible: { // Keep _focusVisible consistent
          borderColor: colorMode === 'light'
            ? 'highContrast.light.focus'
            : 'highContrast.dark.focus',
          boxShadow: 'high-contrast-focus',
          outline: 'none',
        }
      };
    }

    return {};
  }, [variant, colorMode, focusStyles]);

  // Size styles - memoized to prevent recalculation
  const sizeStyle = useMemo(() => {
    switch (size) {
      case 'sm':
        return { px: 3, py: 1, fontSize: 'sm', height: '32px' }; // Added height
      case 'lg':
        return { px: 4, py: 3, fontSize: 'lg', height: '48px' }; // Added height
      case 'md':
      default:
        return { px: 4, py: 2, fontSize: 'md', height: '40px' }; // Added height
    }
  }, [size]);

  // Disabled styles - memoized to prevent recalculation
  const disabledStyle = useMemo(() => isDisabled ? {
    opacity: 0.6,
    cursor: 'not-allowed',
    bg: colorMode === 'light' ? 'gray.100' : 'gray.700',
    borderColor: colorMode === 'light' ? 'gray.200' : 'gray.600',
    _hover: {},
    _active: {},
    _focus: { boxShadow: 'none' }, // Prevent focus ring on disabled
    _focusVisible: { boxShadow: 'none' },
  } : {}, [isDisabled, colorMode]);

  // Invalid styles - memoized to prevent recalculation
  const invalidStyle = useMemo(() => isInvalid ? {
    borderColor: 'red.500',
    boxShadow: `0 0 0 1px var(--chakra-colors-red-500)`,
    _hover: {
      borderColor: 'red.500',
    },
    _focus: { // Keep _focus for consistency if needed, but _focusVisible is preferred
      borderColor: 'red.500',
      boxShadow: `0 0 0 1px var(--chakra-colors-red-500)`,
    },
    _focusVisible: {
      borderColor: 'red.500',
      boxShadow: `0 0 0 3px ${colorMode === 'light' ? 'rgba(229, 62, 62, 0.6)' : 'rgba(252, 129, 129, 0.6)'}`, // Error focus ring
    }
  } : {}, [isInvalid, colorMode]);

  // Memoize variant style to prevent recalculation on every render
  const variantStyle = useMemo(() => getVariantStyle(), [getVariantStyle]);

  // Memoize hover and active styles with GPU acceleration
  const interactionStyles = useMemo(() => {
    // If user prefers reduced motion, use simpler animations or none
    if (prefersReducedMotion) {
      return {
        _hover: !isDisabled ? {
          borderColor: colorMode === 'light' ? 'gray.400' : 'gray.400',
        } : {},
        _active: !isDisabled ? {
          borderColor: colorMode === 'light' ? 'blue.500' : 'blue.300',
        } : {},
      };
    }

    // Use GPU-accelerated animations for standard experience
    return {
      _hover: !isDisabled ? {
        borderColor: colorMode === 'light' ? 'gray.400' : 'gray.400',
        transform: 'translate3d(0, -1px, 0)', // Subtle GPU-accelerated transform
        transition: animations.createAdaptiveTransition(['transform', 'border-color'], 'fast', animations.easings.easeOut),
      } : {},
      _active: !isDisabled ? {
        borderColor: colorMode === 'light' ? 'blue.500' : 'blue.300',
        transform: 'translate3d(0, 0, 0)', // Reset transform
        transition: animations.createAdaptiveTransition(['transform', 'border-color'], 'ultraFast', animations.easings.easeOut),
      } : {},
    };
  }, [isDisabled, colorMode, prefersReducedMotion]);

  // Apply GPU acceleration utilities
  const gpuAcceleration = animations.performanceUtils.forceGPU;

  // Label animation styles
  const labelAnimationStyles = useMemo(() => {
    if (prefersReducedMotion) {
      return {}; // No animation for reduced motion
    }

    // Basic floating label effect (can be enhanced)
    const isFilled = value && value.toString().length > 0;
    return {
      position: 'absolute',
      left: 4,
      top: '50%',
      transform: isFilled ? 'translate3d(0, -140%, 0) scale(0.85)' : 'translate3d(0, -50%, 0) scale(1)',
      transformOrigin: 'top left',
      pointerEvents: 'none',
      color: colorMode === 'light' ? 'gray.600' : 'gray.400',
      transition: animations.createAdaptiveTransition(['transform', 'color'], 'normal', animations.easings.easeOut),
      _groupFocusWithin: {
        transform: 'translate3d(0, -140%, 0) scale(0.85)',
        color: colorMode === 'light' ? 'blue.500' : 'blue.300',
      },
    };
  }, [prefersReducedMotion, colorMode, value]);

  // Determine aria-describedby value
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  // Optimize event handlers with useCallback
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
  }, [onChange]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(e);
  }, [onBlur]);

  return (
    <FormControl
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      isRequired={isRequired}
      position="relative" // Needed for label positioning
      role="group" // For _groupFocusWithin
      {...rest}
    >
      {label && (
        <FormLabel
          htmlFor={id}
          id={labelId}
          // {...labelAnimationStyles} // Apply label animation styles
          // {...gpuAcceleration} // Apply GPU acceleration to label animations
          // Basic label styling for now, animation needs refinement
          fontSize="sm"
          fontWeight="medium"
          mb={1}
          display="block"
          color={colorMode === 'light' ? 'gray.700' : 'gray.300'}
        >
          {label}
        </FormLabel>
      )}

      <Box position="relative">
        {leftElement && (
          <Box
            position="absolute"
            left={2}
            top="50%"
            transform="translate3d(0, -50%, 0)" // GPU-accelerated transform
            zIndex={2}
            display="flex"
            alignItems="center"
            aria-hidden="true"
            {...gpuAcceleration} // Apply GPU acceleration
          >
            {leftElement}
          </Box>
        )}

        <ChakraInput // Use ChakraInput directly
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          isReadOnly={isReadOnly}
          isDisabled={isDisabled}
          isRequired={isRequired} // Pass isRequired to ChakraInput
          autoComplete={autoComplete}
          borderRadius="md"
          width="100%"
          transition={animations.createAdaptiveTransition(['border-color', 'box-shadow', 'transform'], 'normal', animations.easings.easeOut)}
          {...interactionStyles}
          {...variantStyle} // Includes _focusVisible
          {...sizeStyle}
          {...disabledStyle}
          {...invalidStyle} // Includes invalid focus/focusVisible
          {...gpuAcceleration} // Apply GPU acceleration
          pl={leftElement ? 10 : undefined} // Use pl instead of paddingLeft
          pr={rightElement ? 10 : undefined} // Use pr instead of paddingRight
          // ARIA attributes for accessibility
          aria-invalid={isInvalid}
          // aria-required={isRequired} // ChakraInput handles this based on isRequired prop
          aria-describedby={describedBy} // Link to error/helper message if present
          aria-labelledby={labelId} // Associate label if exists
        />

        {rightElement && (
          <Box
            position="absolute"
            right={2}
            top="50%"
            transform="translate3d(0, -50%, 0)" // GPU-accelerated transform
            zIndex={2}
            display="flex"
            alignItems="center"
            aria-hidden="true"
            {...gpuAcceleration} // Apply GPU acceleration
          >
            {rightElement}
          </Box>
        )}
      </Box>

      {helperText && !isInvalid && (
        <FormHelperText id={helperId}>{helperText}</FormHelperText>
      )}

      {isInvalid && errorMessage && (
        <FormErrorMessage id={errorId}>{errorMessage}</FormErrorMessage>
      )}
    </FormControl>
  );
}, areEqual);

// Display name for debugging
Input.displayName = 'Input';

export default Input;

