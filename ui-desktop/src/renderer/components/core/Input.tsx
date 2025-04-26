import React, { memo, useState, useCallback, useMemo } from 'react';
import { Box, BoxProps, useColorMode, Input as ChakraInput, InputProps as ChakraInputProps } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';

export interface InputProps extends Omit<ChakraInputProps, 'size'> {
  variant?: 'glass' | 'solid' | 'outline' | 'high-contrast';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  /**
   * ID for the input element, required for accessibility
   */
  id?: string;
  /**
   * Description for the input field, used for aria-describedby
   */
  description?: string;
  /**
   * Whether the field is required
   */
  isRequired?: boolean;
}

// Using React.memo to prevent unnecessary re-renders
export const Input: React.FC<InputProps> = memo(({
  variant = 'glass',
  size = 'md',
  label,
  error,
  leftElement,
  rightElement,
  id,
  description,
  isRequired = false,
  onChange,
  onFocus,
  onBlur,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  
  // Generate stable IDs for accessibility
  const inputId = useMemo(() => id || `input-${Math.random().toString(36).substr(2, 9)}`, [id]);
  const descriptionId = useMemo(() => description ? `${inputId}-description` : undefined, [description, inputId]);
  const errorId = useMemo(() => error ? `${inputId}-error` : undefined, [error, inputId]);
  
  // Memoize input style to prevent recalculation on every render
  const getInputStyle = useMemo(() => {
    if (variant === 'glass') {
      return {
        ...(colorMode === 'light' 
          ? glassmorphism.create(0.5, 8, 1)
          : glassmorphism.createDark(0.5, 8, 1)),
        _focus: {
          borderColor: 'primary.500',
          boxShadow: `0 0 0 1px ${colorMode === 'light' ? 'rgba(62, 92, 118, 0.6)' : 'rgba(62, 92, 118, 0.4)'}`,
        }
      };
    } else if (variant === 'solid') {
      return {
        bg: colorMode === 'light' ? 'white' : 'gray.800',
        border: '1px solid',
        borderColor: colorMode === 'light' ? 'gray.200' : 'gray.700',
        _focus: {
          borderColor: 'primary.500',
          boxShadow: `0 0 0 1px ${colorMode === 'light' ? 'rgba(62, 92, 118, 0.6)' : 'rgba(62, 92, 118, 0.4)'}`,
        }
      };
    } else if (variant === 'outline') {
      return {
        bg: 'transparent',
        border: '1px solid',
        borderColor: colorMode === 'light' ? 'gray.300' : 'gray.600',
        _focus: {
          borderColor: 'primary.500',
          boxShadow: `0 0 0 1px ${colorMode === 'light' ? 'rgba(62, 92, 118, 0.6)' : 'rgba(62, 92, 118, 0.4)'}`,
        }
      };
    } else if (variant === 'high-contrast') {
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
        _focus: {
          borderColor: colorMode === 'light' 
            ? 'highContrast.light.focus' 
            : 'highContrast.dark.focus',
          boxShadow: 'high-contrast-focus',
          outline: 'none',
        }
      };
    }
    
    return {};
  }, [variant, colorMode]);
  
  // Memoize size styles to prevent recalculation on every render
  const getSizeStyle = useMemo(() => {
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
  
  // Memoize error styles
  const errorStyle = useMemo(() => error ? {
    borderColor: 'error.500',
    _focus: {
      borderColor: 'error.500',
      boxShadow: `0 0 0 1px ${colorMode === 'light' ? 'rgba(244, 67, 54, 0.6)' : 'rgba(244, 67, 54, 0.4)'}`,
    }
  } : {}, [error, colorMode]);

  // Accessibility attributes
  const accessibilityProps = useMemo(() => ({
    id: inputId,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': [descriptionId, errorId].filter(Boolean).join(' ') || undefined,
    'aria-required': isRequired,
  }), [inputId, error, descriptionId, errorId, isRequired]);
  
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
    <Box width="100%">
      {/* Label */}
      {label && (
        <Box 
          as="label" 
          fontSize="sm" 
          fontWeight="medium" 
          mb={1} 
          display="block"
          color={colorMode === 'light' ? 'gray.700' : 'gray.300'}
          htmlFor={inputId}
        >
          {label}
          {isRequired && (
            <Box as="span" color="error.500" ml={1} aria-hidden="true">
              *
            </Box>
          )}
        </Box>
      )}
      
      {/* Description */}
      {description && (
        <Box 
          id={descriptionId}
          fontSize="sm" 
          color={colorMode === 'light' ? 'gray.600' : 'gray.400'}
          mb={2}
        >
          {description}
        </Box>
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
            aria-hidden="true"
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
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...getInputStyle}
          {...getSizeStyle}
          {...errorStyle}
          {...accessibilityProps}
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
            aria-hidden="true"
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
          role="alert"
        >
          {error}
        </Box>
      )}
    </Box>
  );
});

Input.displayName = 'Input';

export default Input;
