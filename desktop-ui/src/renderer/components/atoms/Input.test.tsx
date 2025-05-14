import React from 'react';
import { render, screen, fireEvent } from '../../test-utils';
import Input from './Input';

describe('Input Component', () => {
  test('renders input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  test('handles value change', () => {
    const handleChange = jest.fn();
    render(<Input placeholder="Enter text" onChange={handleChange} />);
    
    const input = screen.getByPlaceholderText('Enter text');
    fireEvent.change(input, { target: { value: 'Hello World' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test('renders disabled input when disabled prop is true', () => {
    render(<Input placeholder="Enter text" disabled />);
    expect(screen.getByPlaceholderText('Enter text')).toBeDisabled();
  });

  test('applies custom className', () => {
    render(<Input placeholder="Enter text" className="custom-class" />);
    expect(screen.getByPlaceholderText('Enter text')).toHaveClass('custom-class');
  });

  test('renders input with label', () => {
    render(<Input label="Username" placeholder="Enter username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
  });

  test('renders input with error message', () => {
    render(<Input placeholder="Enter text" error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter text')).toHaveClass('input-error');
  });

  test('renders input with helper text', () => {
    render(<Input placeholder="Enter text" helperText="Enter your full name" />);
    expect(screen.getByText('Enter your full name')).toBeInTheDocument();
  });

  test('renders input with different sizes', () => {
    const { rerender } = render(<Input placeholder="Small" size="sm" />);
    expect(screen.getByPlaceholderText('Small')).toHaveClass('input-sm');
    
    rerender(<Input placeholder="Medium" size="md" />);
    expect(screen.getByPlaceholderText('Medium')).toHaveClass('input-md');
    
    rerender(<Input placeholder="Large" size="lg" />);
    expect(screen.getByPlaceholderText('Large')).toHaveClass('input-lg');
  });

  test('renders input with prefix and suffix', () => {
    render(
      <Input
        placeholder="Enter amount"
        prefix="$"
        suffix=".00"
      />
    );
    
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('.00')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter amount')).toBeInTheDocument();
  });

  test('renders input with icon', () => {
    render(<Input placeholder="Search" icon="search-icon" />);
    
    const input = screen.getByPlaceholderText('Search');
    expect(input).toBeInTheDocument();
    // Check if the icon class is applied
    expect(input.parentElement?.querySelector('.search-icon')).toBeTruthy();
  });

  test('renders input with custom type', () => {
    render(<Input placeholder="Enter password" type="password" />);
    expect(screen.getByPlaceholderText('Enter password')).toHaveAttribute('type', 'password');
  });

  test('focuses input when autoFocus is true', () => {
    render(<Input placeholder="Auto focus" autoFocus />);
    expect(screen.getByPlaceholderText('Auto focus')).toHaveFocus();
  });
});
