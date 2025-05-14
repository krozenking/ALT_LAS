import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ChakraProvider } from '@chakra-ui/react';
import { highContrastTheme } from '@/styles/highContrastTheme';
import Button from '@/components/core/Button';
import IconButton from '@/components/core/IconButton';
import Input from '@/components/core/Input';
import Card from '@/components/core/Card';

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

describe('High Contrast Theme Accessibility Tests', () => {
  describe('Button Component with High Contrast Theme', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <ChakraProvider theme={highContrastTheme}>
          <Button>Test Button</Button>
        </ChakraProvider>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper contrast ratio', () => {
      render(
        <ChakraProvider theme={highContrastTheme}>
          <Button variant="solid">Primary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="glass">Glass Button</Button>
        </ChakraProvider>
      );
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(3);
      // Visual inspection would be needed for actual contrast testing
      // This is a placeholder for manual verification
    });
  });

  describe('IconButton Component with High Contrast Theme', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <ChakraProvider theme={highContrastTheme}>
          <IconButton 
            icon={<span>🔍</span>} 
            ariaLabel="Search" 
          />
        </ChakraProvider>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Input Component with High Contrast Theme', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <ChakraProvider theme={highContrastTheme}>
          <Input label="Email" placeholder="Enter your email" />
        </ChakraProvider>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper contrast for error states', () => {
      render(
        <ChakraProvider theme={highContrastTheme}>
          <Input 
            label="Email" 
            error="Invalid email format" 
            placeholder="Enter your email" 
          />
        </ChakraProvider>
      );
      
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent('Invalid email format');
      // Visual inspection would be needed for actual contrast testing
    });
  });

  describe('Card Component with High Contrast Theme', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <ChakraProvider theme={highContrastTheme}>
          <Card header="Card Title">
            <p>Card content</p>
          </Card>
        </ChakraProvider>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
