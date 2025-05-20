// src/components/__tests__/TextField.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TextField } from '../TextField';

expect.extend(toHaveNoViolations);

describe('TextField Component', () => {
  test('renders correctly with default props', () => {
    render(<TextField label="Name" />);
    
    // Check if label is rendered
    expect(screen.getByText('Name')).toBeInTheDocument();
    
    // Check if input is rendered
    const input = screen.getByLabelText('Name');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveValue('');
  });
  
  test('renders with placeholder', () => {
    render(<TextField label="Email" placeholder="Enter your email" />);
    
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('placeholder', 'Enter your email');
  });
  
  test('renders with initial value', () => {
    render(<TextField label="Username" value="johndoe" />);
    
    const input = screen.getByLabelText('Username');
    expect(input).toHaveValue('johndoe');
  });
  
  test('calls onChange handler when value changes', () => {
    const handleChange = jest.fn();
    render(<TextField label="Password" onChange={handleChange} />);
    
    const input = screen.getByLabelText('Password');
    fireEvent.change(input, { target: { value: 'secret123' } });
    
    expect(handleChange).toHaveBeenCalledWith('secret123');
  });
  
  test('renders with different input types', () => {
    const { rerender } = render(<TextField label="Password" type="password" />);
    
    let input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
    
    rerender(<TextField label="Password" type="email" />);
    input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'email');
    
    rerender(<TextField label="Password" type="number" />);
    input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'number');
  });
  
  test('renders required indicator when required is true', () => {
    render(<TextField label="Name" required />);
    
    const requiredIndicator = screen.getByText('*');
    expect(requiredIndicator).toBeInTheDocument();
    expect(requiredIndicator).toHaveClass('text-red-500');
  });
  
  test('disables input when disabled is true', () => {
    render(<TextField label="Name" disabled />);
    
    const input = screen.getByLabelText('Name');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('bg-gray-100');
    expect(input).toHaveClass('cursor-not-allowed');
  });
  
  test('renders error message when error is provided', () => {
    render(<TextField label="Email" error="Invalid email address" />);
    
    const errorMessage = screen.getByText('Invalid email address');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass('text-red-600');
    
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('border-red-300');
  });
  
  test('renders helper text when helperText is provided', () => {
    render(<TextField label="Password" helperText="Must be at least 8 characters" />);
    
    const helperText = screen.getByText('Must be at least 8 characters');
    expect(helperText).toBeInTheDocument();
    expect(helperText).toHaveClass('text-gray-500');
  });
  
  test('prioritizes error message over helper text', () => {
    render(
      <TextField 
        label="Password" 
        helperText="Must be at least 8 characters" 
        error="Password is required" 
      />
    );
    
    // Error message should be displayed
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    
    // Helper text should not be displayed
    expect(screen.queryByText('Must be at least 8 characters')).not.toBeInTheDocument();
  });
  
  test('applies full width class when fullWidth is true', () => {
    render(<TextField label="Name" fullWidth />);
    
    const container = screen.getByLabelText('Name').closest('div')?.parentElement;
    expect(container).toHaveClass('w-full');
  });
  
  test('uses provided id for input and label association', () => {
    render(<TextField label="Custom ID" id="custom-id" />);
    
    const input = screen.getByLabelText('Custom ID');
    expect(input).toHaveAttribute('id', 'custom-id');
  });
  
  test('generates id from label when id is not provided', () => {
    render(<TextField label="Generated ID" />);
    
    const input = screen.getByLabelText('Generated ID');
    expect(input).toHaveAttribute('id', 'textfield-generated-id');
  });
  
  test('has no accessibility violations', async () => {
    const { container } = render(<TextField label="Accessible Field" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('has no accessibility violations with error', async () => {
    const { container } = render(
      <TextField label="Accessible Field" error="This field has an error" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
