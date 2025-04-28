import React, { useId } from 'react';
import { Box, BoxProps, useColorMode, Heading } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';

export interface CardProps extends BoxProps {
  variant?: 'glass' | 'solid' | 'outline';
  header?: React.ReactNode;
  headerLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'; // Allow specifying header level
  footer?: React.ReactNode;
  isHoverable?: boolean;
  role?: string; // Allow overriding the default role
}

export const Card: React.FC<CardProps> = ({
  variant = 'glass',
  header,
  headerLevel = 'h3', // Default header level
  footer,
  isHoverable = true,
  children,
  role = 'region', // Default role to region
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const headerId = useId();
  const contentId = useId();

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

  // Focus style (applied if the card itself is made focusable, e.g., tabIndex={0})
  const focusStyle = {
    _focus: {
        outline: 'none', // Remove default outline
        boxShadow: 'outline', // Use Chakra's focus outline style
        zIndex: 1, // Ensure focus style is visible
    }
  };

  // Determine aria-labelledby based on header presence
  const ariaLabelledBy = header ? headerId : undefined;

  return (
    <Box
      display="flex"
      flexDirection="column"
      overflow="hidden"
      transition="all 0.2s ease-in-out"
      {...getCardStyle()}
      {...hoverStyle}
      {...focusStyle} // Apply focus style
      role={role} // Apply role
      aria-labelledby={ariaLabelledBy} // Label by header if exists
      aria-describedby={contentId} // Describe by content
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
          {/* Render header content, potentially wrapping in a Heading tag */} 
          {typeof header === 'string' ? (
            <Heading as={headerLevel} size="md" id={headerId}>{header}</Heading>
          ) : (
            <Box id={headerId}>{header}</Box> // Use Box if header is complex node
          )}
        </Box>
      )}

      {/* Card Content */}
      <Box
        p={4}
        flex="1"
        className="card-content"
        id={contentId} // Add id for potential aria-describedby usage
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

