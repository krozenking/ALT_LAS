import React, { memo, useState, useCallback, useMemo } from 'react';
import { Box, BoxProps, useColorMode } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';

export interface ButtonProps extends BoxProps {
  variant?: 'glass' | 'glass-primary' | 'glass-secondary' | 'solid' | 'outline' | 'high-contrast' | 'high-contrast-secondary' | 'high-contrast-outline';
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  /**
   * Accessible label for the button when the content is not descriptive enough
   */
  ariaLabel?: string;
}

// Using React.memo to prevent unnecessary re-renders
export const Button: React.FC<ButtonProps> = memo(({
  variant = 'glass',
  size = 'md',
  isDisabled = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  onClick,
  ariaLabel,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  
  // Memoize style functions to prevent recalculation on every render
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
  
  // Memoize size styles to prevent recalculation on every render
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
  
  // Memoize disabled styles
  const disabledStyle = useMemo(() => isDisabled ? {
    opacity: 0.6,
    cursor: 'not-allowed',
    _hover: {},
    _active: {},
  } : {}, [isDisabled]);
  
  // Memoize loading styles
  const loadingStyle = useMemo(() => isLoading ? {
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
  } : {}, [isLoading]);
  
  // Memoize hover and active styles
  const interactionStyles = useMemo(() => {
    if (isDisabled || isLoading) return {};
    
    if (variant.startsWith('high-contrast')) {
      return {
        _hover: {
          transform: 'scale(1.05)',
          bg: variant === 'high-contrast' 
            ? (colorMode === 'light' ? 'blue.800' : 'cyan.300')
            : variant === 'high-contrast-secondary'
              ? (colorMode === 'light' ? 'red.800' : 'yellow.300')
              : 'transparent',
        },
        _active: {
          transform: 'scale(1)',
        },
        _focus: {
          boxShadow: 'high-contrast-focus',
          outline: 'none',
        },
      };
    }
    
    return {
      _hover: {
        transform: 'translateY(-2px)',
        boxShadow: 'md',
        ...(variant === 'glass-primary' && {
          bg: colorMode === 'light' 
            ? 'rgba(62, 92, 118, 0.9)' 
            : 'rgba(62, 92, 118, 0.7)',
        }),
        ...(variant === 'glass-secondary' && {
          bg: colorMode === 'light' 
            ? 'rgba(199, 144, 96, 0.9)' 
            : 'rgba(199, 144, 96, 0.7)',
        }),
      },
      _active: {
        transform: 'translateY(0)',
      },
      _focus: {
        boxShadow: 'outline',
        outline: 'none',
      },
    };
  }, [variant, colorMode, isDisabled, isLoading]);
  
  // Accessibility attributes
  const accessibilityProps = useMemo(() => ({
    role: 'button',
    'aria-label': ariaLabel || (typeof children === 'string' ? children : undefined),
    'aria-disabled': isDisabled,
    'aria-busy': isLoading,
    tabIndex: isDisabled ? -1 : 0,
    onKeyDown: !isDisabled && !isLoading 
      ? (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.(e as unknown as React.MouseEvent);
          }
        }
      : undefined,
  }), [ariaLabel, children, isDisabled, isLoading, onClick]);
  
  // Handle click event with useCallback to prevent recreation on every render
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isDisabled && !isLoading && onClick) {
      onClick(e);
    }
  }, [isDisabled, isLoading, onClick]);
  
  // Combine all styles
  const combinedStyles = useMemo(() => ({
    ...getVariantStyle(),
    ...getSizeStyle,
    ...disabledStyle,
    ...loadingStyle,
    ...interactionStyles,
  }), [getVariantStyle, getSizeStyle, disabledStyle, loadingStyle, interactionStyles]);
  
  return (
    <Box
      as="button"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="md"
      fontWeight="medium"
      transition="all 0.2s ease-in-out"
      onClick={handleClick}
      {...combinedStyles}
      {...accessibilityProps}
      {...rest}
    >
      {leftIcon && <Box mr={2}>{leftIcon}</Box>}
      {isLoading ? <Box opacity={0}>{children}</Box> : children}
      {rightIcon && <Box ml={2}>{rightIcon}</Box>}
    </Box>
  );
});

Button.displayName = 'Button';

export default Button;
