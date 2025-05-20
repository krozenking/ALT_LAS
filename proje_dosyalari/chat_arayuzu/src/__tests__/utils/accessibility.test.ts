/**
 * @jest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button, Input, Textarea, Heading, Text, Box } from '@chakra-ui/react';

// Jest-axe matchers'ı ekle
expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  describe('Button Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Button>Test Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper accessibility when disabled', async () => {
      const { container } = render(<Button isDisabled>Disabled Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper accessibility with aria-label', async () => {
      const { container } = render(<Button aria-label="Close dialog">X</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Input Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Box>
          <label htmlFor="test-input">Test Input</label>
          <Input id="test-input" placeholder="Enter text" />
        </Box>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper accessibility when required', async () => {
      const { container } = render(
        <Box>
          <label htmlFor="required-input">Required Input</label>
          <Input id="required-input" isRequired placeholder="Required field" />
        </Box>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Textarea Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Box>
          <label htmlFor="test-textarea">Test Textarea</label>
          <Textarea id="test-textarea" placeholder="Enter text" />
        </Box>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Heading Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Box>
          <Heading as="h1">Main Heading</Heading>
          <Text>Some content</Text>
          <Heading as="h2">Sub Heading</Heading>
          <Text>More content</Text>
        </Box>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should maintain proper heading hierarchy', async () => {
      const { container } = render(
        <Box>
          <Heading as="h1">Main Heading</Heading>
          <Box>
            <Heading as="h2">Sub Heading 1</Heading>
            <Text>Content</Text>
            <Heading as="h3">Sub-sub Heading</Heading>
            <Text>More content</Text>
          </Box>
          <Heading as="h2">Sub Heading 2</Heading>
        </Box>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Color Contrast', () => {
    it('should have sufficient color contrast', async () => {
      const { container } = render(
        <Box>
          <Text color="gray.800" bg="white">Dark text on white background</Text>
          <Text color="white" bg="gray.800">White text on dark background</Text>
        </Box>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Focus Management', () => {
    it('should have visible focus indicators', async () => {
      const { container } = render(
        <Box>
          <Button>Focusable Button</Button>
          <Input placeholder="Focusable Input" />
        </Box>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
