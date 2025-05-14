import React from 'react';
import { render, screen, fireEvent } from '../../test-utils';
import Button from './Button';

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('renders disabled button when disabled prop is true', () => {
    render(<Button disabled>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeDisabled();
  });

  test('applies custom className', () => {
    render(<Button className="custom-class">Click Me</Button>);
    expect(screen.getByText('Click Me')).toHaveClass('custom-class');
  });

  test('renders button with icon', () => {
    render(
      <Button icon="test-icon">
        Click Me
      </Button>
    );
    
    const button = screen.getByText('Click Me');
    expect(button).toBeInTheDocument();
    // Check if the icon class is applied
    expect(button.querySelector('.test-icon')).toBeTruthy();
  });

  test('renders button with different variants', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText('Primary')).toHaveClass('btn-primary');
    
    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText('Secondary')).toHaveClass('btn-secondary');
    
    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByText('Outline')).toHaveClass('btn-outline');
    
    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByText('Ghost')).toHaveClass('btn-ghost');
  });

  test('renders button with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByText('Small')).toHaveClass('btn-sm');
    
    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByText('Medium')).toHaveClass('btn-md');
    
    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByText('Large')).toHaveClass('btn-lg');
  });

  test('renders button with loading state', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByText('Loading')).toHaveClass('btn-loading');
    expect(screen.getByText('Loading')).toBeDisabled();
  });

  test('renders button with full width', () => {
    render(<Button fullWidth>Full Width</Button>);
    expect(screen.getByText('Full Width')).toHaveClass('btn-full-width');
  });

  test('renders button with custom type', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByText('Submit').closest('button')).toHaveAttribute('type', 'submit');
  });
});
