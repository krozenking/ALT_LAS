import React from 'react';
import { Box, BoxProps, useColorMode } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';

export interface CardProps extends BoxProps {
  variant?: 'glass' | 'solid' | 'outline';
  header?: React.ReactNode;
  footer?: React.ReactNode;
  isHoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  variant = 'glass',
  header,
  footer,
  isHoverable = true,
  children,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  
  // Apply glassmorphism effect based on color mode and variant
  const getCardStyle = () => {
    if (variant === 'glass') {
      return colorMode === 'light' 
        ? glassmorphism.create(0.7, 10, 1)
        : glassmorphism.createDark(0.7, 10, 1);
    } else if (variant === 'solid') {
      return {
        bg: colorMode === 'light' ? 'white' : 'gray.800',
        boxShadow: 'md',
        borderRadius: 'md',
      };
    } else if (variant === 'outline') {
      return {
        bg: 'transparent',
        border: '1px solid',
        borderColor: colorMode === 'light' ? 'gray.200' : 'gray.700',
        borderRadius: 'md',
      };
    }
    
    return {};
  };
  
  // Hover effect
  const hoverStyle = isHoverable ? {
    _hover: {
      transform: 'translateY(-4px)',
      boxShadow: 'lg',
      transition: 'all 0.3s ease',
    }
  } : {};
  
  return (
    <Box
      display="flex"
      flexDirection="column"
      overflow="hidden"
      transition="all 0.2s ease-in-out"
      {...getCardStyle()}
      {...hoverStyle}
      {...rest}
    >
      {/* Card Header */}
      {header && (
        <Box
          p={4}
          borderBottom="1px solid"
          borderColor={colorMode === 'light' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}
          className="card-header"
        >
          {header}
        </Box>
      )}
      
      {/* Card Content */}
      <Box
        p={4}
        flex="1"
        className="card-content"
      >
        {children}
      </Box>
      
      {/* Card Footer */}
      {footer && (
        <Box
          p={4}
          borderTop="1px solid"
          borderColor={colorMode === 'light' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}
          className="card-footer"
        >
          {footer}
        </Box>
      )}
    </Box>
  );
};

export default Card;
