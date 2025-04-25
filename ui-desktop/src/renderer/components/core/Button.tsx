import React from 'react';
import { Box, BoxProps, useColorMode } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';

export interface ButtonProps extends BoxProps {
  variant?: 'glass' | 'glass-primary' | 'glass-secondary' | 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'glass',
  size = 'md',
  isDisabled = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  onClick,
  children,
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
  
  // Size styles
  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { px: 3, py: 1, fontSize: 'sm' };
      case 'lg':
        return { px: 6, py: 3, fontSize: 'lg' };
      case 'md':
      default:
        return { px: 4, py: 2, fontSize: 'md' };
    }
  };
  
  // Disabled styles
  const disabledStyle = isDisabled ? {
    opacity: 0.6,
    cursor: 'not-allowed',
    _hover: {},
    _active: {},
  } : {};
  
  // Loading styles
  const loadingStyle = isLoading ? {
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
  } : {};
  
  return (
    <Box
      as="button"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="md"
      fontWeight="medium"
      transition="all 0.2s ease-in-out"
      _hover={!isDisabled && !isLoading ? {
        transform: 'translateY(-2px)',
        boxShadow: 'md',
      } : {}}
      _active={!isDisabled && !isLoading ? {
        transform: 'translateY(0)',
      } : {}}
      {...getGlassStyle()}
      {...getSizeStyle()}
      {...disabledStyle}
      {...loadingStyle}
      onClick={!isDisabled && !isLoading ? onClick : undefined}
      {...rest}
    >
      {leftIcon && (
        <Box mr={2} display="inline-flex" alignItems="center">
          {leftIcon}
        </Box>
      )}
      {isLoading ? <Box opacity={0}>{children}</Box> : children}
      {rightIcon && (
        <Box ml={2} display="inline-flex" alignItems="center">
          {rightIcon}
        </Box>
      )}
    </Box>
  );
};

export default Button;
