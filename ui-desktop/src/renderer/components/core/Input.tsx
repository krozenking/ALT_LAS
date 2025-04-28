import React, { useId, memo } from 'react';
import { Box, BoxProps, useColorMode, Input as ChakraInput, FormLabel, FormHelperText, FormErrorMessage, FormControl } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';
import { animations } from '@/styles/animations'; // Import animations

export interface InputProps extends BoxProps {
  variant?: 'glass' | 'glass-primary' | 'glass-secondary' | 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorMessage?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  type?: string;
  name?: string;
  id?: string;
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

  // Deep comparison is expensive, so we'll assume elements changed if they're provided
  // This is a trade-off between performance and correctness
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
  id: propId,
  autoComplete,
  leftElement,
  rightElement,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const generatedId = useId();
  const id = propId || `input-${generatedId}`;
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
        border: '1px solid',
        borderColor: colorMode === 'light' ? 'gray.200' : 'gray.600',
      };
    } else if (variant === 'outline') {
      return {
        bg: 'transparent',
        border: '1px solid',
        borderColor: colorMode === 'light' ? 'gray.300' : 'gray.500',
        color: colorMode === 'light' ? 'gray.800' : 'white',
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
        return { px: 4, py: 3, fontSize: 'lg' };
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

  // Invalid styles - memoized to prevent recalculation
  const invalidStyle = React.useMemo(() => isInvalid ? {
    borderColor: 'red.500',
    boxShadow: `0 0 0 1px var(--chakra-colors-red-500)`,
    _hover: {
      borderColor: 'red.500',
    },
    _focus: {
      borderColor: 'red.500',
      boxShadow: `0 0 0 1px var(--chakra-colors-red-500)`,
    },
  } : {}, [isInvalid]);

  // Improved focus styles for better visibility (WCAG 2.1 AA compliance) - memoized
  const focusStyles = React.useMemo(() => !isDisabled ? {
    outline: 'none', // Remove default outline
    boxShadow: `0 0 0 3px ${colorMode === 'light' ? 'rgba(66, 153, 225, 0.6)' : 'rgba(99, 179, 237, 0.6)'}`, // Higher contrast focus ring
    borderColor: colorMode === 'light' ? 'blue.500' : 'blue.300',
    zIndex: 1, // Ensure focus style is visible
  } : {}, [isDisabled, colorMode]);

  // Memoize glass style to prevent recalculation on every render
  const glassStyle = React.useMemo(() => getGlassStyle(), [variant, colorMode]);

  // Memoize hover and active styles with GPU acceleration
  const interactionStyles = React.useMemo(() => {
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
  const labelAnimationStyles = React.useMemo(() => {
    if (prefersReducedMotion) {
      return {}; // No animation for reduced motion
    }
    
    return {
      transition: animations.createAdaptiveTransition(['transform', 'color', 'font-size'], 'normal', animations.easings.easeOut),
      _focusWithin: {
        transform: 'translate3d(0, -12px, 0) scale(0.85)',
        color: colorMode === 'light' ? 'blue.500' : 'blue.300',
      },
    };
  }, [prefersReducedMotion, colorMode]);

  return (
    <FormControl
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      isRequired={isRequired}
      {...rest}
    >
      {label && (
        <FormLabel 
          htmlFor={id}
          position="relative"
          {...labelAnimationStyles}
          {...gpuAcceleration} // Apply GPU acceleration to label animations
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
            {...gpuAcceleration} // Apply GPU acceleration
          >
            {leftElement}
          </Box>
        )}
        
        <Box
          as="input"
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          readOnly={isReadOnly}
          disabled={isDisabled}
          required={isRequired}
          autoComplete={autoComplete}
          borderRadius="md"
          width="100%"
          transition={animations.createAdaptiveTransition(['border-color', 'box-shadow', 'transform'], 'normal', animations.easings.easeOut)}
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
          {...invalidStyle}
          {...gpuAcceleration} // Apply GPU acceleration
          paddingLeft={leftElement ? 10 : undefined}
          paddingRight={rightElement ? 10 : undefined}
        />
        
        {rightElement && (
          <Box 
            position="absolute" 
            right={2} 
            top="50%" 
            transform="translate3d(0, -50%, 0)" // GPU-accelerated transform
            zIndex={2}
            {...gpuAcceleration} // Apply GPU acceleration
          >
            {rightElement}
          </Box>
        )}
      </Box>
      
      {helperText && !isInvalid && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
      
      {isInvalid && errorMessage && (
        <FormErrorMessage>{errorMessage}</FormErrorMessage>
      )}
    </FormControl>
  );
}, areEqual);

// Display name for debugging
Input.displayName = 'Input';

export default Input;
