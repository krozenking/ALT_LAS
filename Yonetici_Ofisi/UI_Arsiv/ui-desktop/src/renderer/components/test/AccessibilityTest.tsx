import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ChakraProvider } from '@chakra-ui/react';
import Button from '../core/Button';
import IconButton from '../core/IconButton';
import Input from '../core/Input';
import Card from '../core/Card';

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  describe('Button Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <ChakraProvider>
          <Button>Test Button</Button>
        </ChakraProvider>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper aria attributes when disabled', () => {
      render(
        <ChakraProvider>
          <Button isDisabled>Disabled Button</Button>
        </ChakraProvider>
      );
      
      const button = screen.getByRole('button', { name: /disabled button/i });
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should have proper aria attributes when loading', () => {
      render(
        <ChakraProvider>
          <Button isLoading>Loading Button</Button>
        </ChakraProvider>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('IconButton Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <ChakraProvider>
          <IconButton 
            icon={<span>🔍</span>} 
            ariaLabel="Search" 
          />
        </ChakraProvider>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper aria-label', () => {
      render(
        <ChakraProvider>
          <IconButton 
            icon={<span>🔍</span>} 
            ariaLabel="Search" 
          />
        </ChakraProvider>
      );
      
      const button = screen.getByRole('button', { name: /search/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Input Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <ChakraProvider>
          <Input label="Email" placeholder="Enter your email" />
        </ChakraProvider>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper aria attributes when required', () => {
      render(
        <ChakraProvider>
          <Input label="Email" isRequired placeholder="Enter your email" />
        </ChakraProvider>
      );
      
      const input = screen.getByLabelText(/Email/i);
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('should have proper aria attributes when has error', () => {
      render(
        <ChakraProvider>
          <Input 
            label="Email" 
            error="Invalid email format" 
            placeholder="Enter your email" 
          />
        </ChakraProvider>
      );
      
      const input = screen.getByLabelText(/Email/i);
      expect(input).toHaveAttribute('aria-invalid', 'true');
      
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent('Invalid email format');
    });
  });

  describe('Card Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <ChakraProvider>
          <Card header="Card Title">
            <p>Card content</p>
          </Card>
        </ChakraProvider>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading structure', () => {
      render(
        <ChakraProvider>
          <Card header="Card Title" headerLevel="h2">
            <p>Card content</p>
          </Card>
        </ChakraProvider>
      );
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Card Title');
    });

    it('should be focusable when isFocusable is true', () => {
      render(
        <ChakraProvider>
          <Card header="Interactive Card" isFocusable>
            <p>Card content</p>
          </Card>
        </ChakraProvider>
      );
      
      const card = screen.getByRole('region');
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });
});
