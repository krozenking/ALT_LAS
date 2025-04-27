import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ChakraProvider } from '@chakra-ui/react';
import Button from '@/components/core/Button'; // Adjust path if necessary

// Extend Vitest's expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock Chakra UI context if needed, or wrap with ChakraProvider
describe('Button Component Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <ChakraProvider>
        <Button>Click Me</Button>
      </ChakraProvider>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations when disabled', async () => {
    const { container } = render(
      <ChakraProvider>
        <Button isDisabled>Cannot Click</Button>
      </ChakraProvider>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations when loading', async () => {
    const { container } = render(
      <ChakraProvider>
        <Button isLoading>Loading...</Button>
      </ChakraProvider>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

