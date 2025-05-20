// src/components/__tests__/Checkbox.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Checkbox } from '../Checkbox';

describe('Checkbox Component', () => {
  test('renders correctly with default props', () => {
    render(<Checkbox label="Test Checkbox" />);
    
    // Check if label is rendered
    expect(screen.getByText('Test Checkbox')).toBeInTheDocument();
    
    // Check if checkbox is rendered and unchecked
    const checkbox = screen.getByRole('checkbox', { name: 'Test Checkbox' });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
    expect(checkbox).not.toBeDisabled();
  });
  
  test('renders checked when checked prop is true', () => {
    render(<Checkbox label="Test Checkbox" checked />);
    
    // Check if checkbox is checked
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });
  
  test('calls onChange when checkbox is clicked', () => {
    const handleChange = jest.fn();
    render(<Checkbox label="Test Checkbox" onChange={handleChange} />);
    
    // Click the checkbox
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    // Check if onChange was called with true
    expect(handleChange).toHaveBeenCalledWith(true);
    
    // Click again to uncheck
    fireEvent.click(checkbox);
    
    // Check if onChange was called with false
    expect(handleChange).toHaveBeenCalledWith(false);
  });
  
  test('disables checkbox when disabled prop is true', () => {
    render(<Checkbox label="Test Checkbox" disabled />);
    
    // Check if checkbox is disabled
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
    expect(checkbox).toHaveClass('opacity-50');
    expect(checkbox).toHaveClass('cursor-not-allowed');
    
    // Check if label has disabled style
    const label = screen.getByText('Test Checkbox');
    expect(label).toHaveClass('text-gray-400');
  });
  
  test('renders error message when error prop is provided', () => {
    render(<Checkbox label="Test Checkbox" error="This is an error message" />);
    
    // Check if error message is displayed
    const errorMessage = screen.getByText('This is an error message');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass('text-red-600');
    
    // Check if checkbox has error styles
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('border-red-300');
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
  });
  
  test('renders helper text when helperText prop is provided', () => {
    render(<Checkbox label="Test Checkbox" helperText="This is helper text" />);
    
    // Check if helper text is displayed
    const helperText = screen.getByText('This is helper text');
    expect(helperText).toBeInTheDocument();
    expect(helperText).toHaveClass('text-gray-500');
  });
  
  test('prioritizes error message over helper text', () => {
    render(
      <Checkbox 
        label="Test Checkbox" 
        helperText="This is helper text" 
        error="This is an error message" 
      />
    );
    
    // Check if error message is displayed
    expect(screen.getByText('This is an error message')).toBeInTheDocument();
    
    // Check if helper text is not displayed
    expect(screen.queryByText('This is helper text')).not.toBeInTheDocument();
  });
  
  test('uses provided id for checkbox and label association', () => {
    render(<Checkbox label="Test Checkbox" id="custom-id" />);
    
    // Check if checkbox has the custom id
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('id', 'custom-id');
    
    // Check if label is associated with the checkbox
    const label = screen.getByText('Test Checkbox');
    expect(label).toHaveAttribute('for', 'custom-id');
  });
  
  test('generates id from label when id is not provided', () => {
    render(<Checkbox label="Generated ID" />);
    
    // Check if checkbox has the generated id
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('id', 'checkbox-generated-id');
  });
  
  test('sets name and value attributes when provided', () => {
    render(
      <Checkbox 
        label="Test Checkbox" 
        name="test-name" 
        value="test-value" 
      />
    );
    
    // Check if checkbox has name and value attributes
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('name', 'test-name');
    expect(checkbox).toHaveAttribute('value', 'test-value');
  });
  
  test('sets indeterminate state when indeterminate prop is true', () => {
    render(<Checkbox label="Test Checkbox" indeterminate />);
    
    // Check if checkbox is in indeterminate state
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(true);
  });
  
  test('has no accessibility violations', async () => {
    const { container } = render(<Checkbox label="Accessible Checkbox" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('has no accessibility violations when checked', async () => {
    const { container } = render(<Checkbox label="Accessible Checkbox" checked />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('has no accessibility violations with error', async () => {
    const { container } = render(
      <Checkbox 
        label="Accessible Checkbox" 
        error="This is an error message" 
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('has no accessibility violations with helper text', async () => {
    const { container } = render(
      <Checkbox 
        label="Accessible Checkbox" 
        helperText="This is helper text" 
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
