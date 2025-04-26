import React, { memo, useMemo } from 'react';
import { Box, BoxProps, useColorMode } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';

export interface CardProps extends BoxProps {
  variant?: 'glass' | 'solid' | 'outline';
  header?: React.ReactNode;
  footer?: React.ReactNode;
  /**
   * Accessible label for the card when the content is not descriptive enough
   */
  ariaLabel?: string;
  /**
   * ARIA role for the card
   */
  ariaRole?: string;
}

// Using React.memo to prevent unnecessary re-renders
export const Card: React.FC<CardProps> = memo(({
  variant = 'glass',
  header,
  footer,
  children,
  ariaLabel,
  ariaRole = 'region',
  ...rest
}) => {
  const { colorMode } = useColorMode();
  
  // Memoize variant style to prevent recalculation on every render
  const getVariantStyle = useMemo(() => {
    if (variant === 'glass') {
      return colorMode === 'light' 
        ? glassmorphism.create(0.7, 10, 1)
        : glassmorphism.createDark(0.7, 10, 1);
    } else if (variant === 'solid') {
      return {
        bg: colorMode === 'light' ? 'white' : 'gray.800',
        border: '1px solid',
        borderColor: colorMode === 'light' ? 'gray.200' : 'gray.700',
        boxShadow: 'md',
      };
    } else if (variant === 'outline') {
      return {
        bg: 'transparent',
        border: '1px solid',
        borderColor: colorMode === 'light' ? 'gray.300' : 'gray.600',
      };
    }
    
    return {};
  }, [variant, colorMode]);
  
  // Accessibility attributes
  const accessibilityProps = useMemo(() => ({
    role: ariaRole,
    'aria-label': ariaLabel,
  }), [ariaRole, ariaLabel]);
  
  return (
    <Box
      borderRadius="lg"
      overflow="hidden"
      display="flex"
      flexDirection="column"
      {...getVariantStyle}
      {...accessibilityProps}
      {...rest}
    >
      {header && (
        <Box 
          p={6} 
          borderBottom="1px solid" 
          borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
          className="card-header"
        >
          {header}
        </Box>
      )}
      
      <Box 
        p={6} 
        flex="1"
        className="card-body"
      >
        {children}
      </Box>
      
      {footer && (
        <Box 
          p={6} 
          borderTop="1px solid" 
          borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
          className="card-footer"
        >
          {footer}
        </Box>
      )}
    </Box>
  );
});

Card.displayName = 'Card';

export default Card;
