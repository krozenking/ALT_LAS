// src/components/__tests__/Button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../Button';

expect.extend(toHaveNoViolations);

describe('Button Component', () => {
  test('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  test('applies correct classes for primary variant', () => {
    render(<Button variant="primary">Primary Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-600');
  });

  test('applies correct classes for secondary variant', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-200');
  });

  test('applies correct classes for tertiary variant', () => {
    render(<Button variant="tertiary">Tertiary Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-transparent');
  });

  test('applies correct classes for different sizes', () => {
    const { rerender } = render(<Button size="sm">Small Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-3 py-1.5 text-sm');

    rerender(<Button size="md">Medium Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-4 py-2 text-base');

    rerender(<Button size="lg">Large Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-6 py-3 text-lg');
  });

  test('applies full width class when fullWidth is true', () => {
    render(<Button fullWidth>Full Width Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  test('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50 cursor-not-allowed');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clickable Button</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('renders with icon when provided', () => {
    render(
      <Button icon={<span data-testid="test-icon">🔍</span>}>
        Button with Icon
      </Button>
    );
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  test('has no accessibility violations', async () => {
    const { container } = render(<Button>Accessible Button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
