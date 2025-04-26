import React, { memo, useState, useCallback, useMemo } from 'react';
import { Box, BoxProps, useColorMode } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';

export interface IconButtonProps extends BoxProps {
  variant?: 'glass' | 'glass-primary' | 'glass-secondary' | 'solid' | 'outline' | 'high-contrast' | 'high-contrast-secondary';
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  isLoading?: boolean;
  icon: React.ReactNode;
  ariaLabel: string;
  onClick?: (e: React.MouseEvent) => void;
}

// Using React.memo to prevent unnecessary re-renders
export const IconButton: React.FC<IconButtonProps> = memo(({
  variant = 'glass',
  size = 'md',
  isDisabled = false,
  isLoading = false,
  icon,
  ariaLabel,
  onClick,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  
  // Memoize variant style to prevent recalculation on every render
  const getGlassStyle = useMemo(() => {
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
  
  // Memoize size styles to prevent recalculation on every render
  const getSizeStyle = useMemo(() => {
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
          boxShadow: 'lg',
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
      },
      _active: {
        transform: 'translateY(0)',
      },
      _focus: {
        boxShadow: 'outline',
        outline: 'none',
      },
    };
  }, [variant, isDisabled, isLoading]);
  
  // Accessibility attributes
  const accessibilityProps = useMemo(() => ({
    role: 'button',
    'aria-label': ariaLabel,
    'aria-disabled': isDisabled,
    'aria-busy': isLoading,
    tabIndex: isDisabled ? -1 : 0,
  }), [ariaLabel, isDisabled, isLoading]);
  
  // Keyboard event handler with useCallback
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isDisabled && !isLoading && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.(e as unknown as React.MouseEvent);
    }
  }, [isDisabled, isLoading, onClick]);
  
  // Click handler with useCallback
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isDisabled && !isLoading && onClick) {
      onClick(e);
    }
  }, [isDisabled, isLoading, onClick]);
  
  return (
    <Box
      as="button"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="md"
      transition="all 0.2s ease-in-out"
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      {...getGlassStyle}
      {...getSizeStyle}
      {...disabledStyle}
      {...loadingStyle}
      {...interactionStyles}
      {...accessibilityProps}
      {...rest}
    >
      {isLoading ? <Box opacity={0}>{icon}</Box> : icon}
    </Box>
  );
});

IconButton.displayName = 'IconButton';

export default IconButton;
