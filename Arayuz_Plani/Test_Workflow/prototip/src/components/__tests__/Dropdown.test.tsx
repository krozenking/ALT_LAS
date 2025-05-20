// src/components/__tests__/Dropdown.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Dropdown, DropdownOption } from '../Dropdown';

const mockOptions: DropdownOption[] = [
  { value: 'option1', label: 'Seçenek 1' },
  { value: 'option2', label: 'Seçenek 2' },
  { value: 'option3', label: 'Seçenek 3' },
];

describe('Dropdown Component', () => {
  test('renders correctly with default props', () => {
    render(<Dropdown label="Test Dropdown" options={mockOptions} />);
    
    // Check if label is rendered
    expect(screen.getByText('Test Dropdown')).toBeInTheDocument();
    
    // Check if button is rendered with placeholder
    const button = screen.getByRole('button', { name: /seçiniz/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    
    // Check if dropdown is closed initially
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  
  test('opens dropdown when clicked', () => {
    render(<Dropdown label="Test Dropdown" options={mockOptions} />);
    
    // Click the dropdown button
    fireEvent.click(screen.getByRole('button'));
    
    // Check if dropdown is open
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();
    
    // Check if all options are rendered
    expect(screen.getByText('Seçenek 1')).toBeInTheDocument();
    expect(screen.getByText('Seçenek 2')).toBeInTheDocument();
    expect(screen.getByText('Seçenek 3')).toBeInTheDocument();
  });
  
  test('selects an option when clicked', async () => {
    const handleChange = jest.fn();
    render(
      <Dropdown 
        label="Test Dropdown" 
        options={mockOptions} 
        onChange={handleChange} 
      />
    );
    
    // Open the dropdown
    fireEvent.click(screen.getByRole('button'));
    
    // Click an option
    fireEvent.click(screen.getByText('Seçenek 2'));
    
    // Check if dropdown is closed
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
    
    // Check if the selected option is displayed
    expect(screen.getByRole('button')).toHaveTextContent('Seçenek 2');
    
    // Check if onChange was called with the correct value
    expect(handleChange).toHaveBeenCalledWith('option2');
  });
  
  test('renders with initial value', () => {
    render(
      <Dropdown 
        label="Test Dropdown" 
        options={mockOptions} 
        value="option3" 
      />
    );
    
    // Check if the selected option is displayed
    expect(screen.getByRole('button')).toHaveTextContent('Seçenek 3');
  });
  
  test('updates when value prop changes', () => {
    const { rerender } = render(
      <Dropdown 
        label="Test Dropdown" 
        options={mockOptions} 
        value="option1" 
      />
    );
    
    // Check if the selected option is displayed
    expect(screen.getByRole('button')).toHaveTextContent('Seçenek 1');
    
    // Update the value prop
    rerender(
      <Dropdown 
        label="Test Dropdown" 
        options={mockOptions} 
        value="option2" 
      />
    );
    
    // Check if the selected option is updated
    expect(screen.getByRole('button')).toHaveTextContent('Seçenek 2');
  });
  
  test('disables dropdown when disabled prop is true', () => {
    render(
      <Dropdown 
        label="Test Dropdown" 
        options={mockOptions} 
        disabled 
      />
    );
    
    // Check if button is disabled
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveClass('bg-gray-100');
    expect(button).toHaveClass('cursor-not-allowed');
    
    // Click the button and check if dropdown remains closed
    fireEvent.click(button);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  
  test('renders error message when error prop is provided', () => {
    render(
      <Dropdown 
        label="Test Dropdown" 
        options={mockOptions} 
        error="This is an error message" 
      />
    );
    
    // Check if error message is displayed
    const errorMessage = screen.getByText('This is an error message');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass('text-red-600');
    
    // Check if button has error styles
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-red-300');
    expect(button).toHaveClass('text-red-900');
  });
  
  test('renders required indicator when required is true', () => {
    render(
      <Dropdown 
        label="Test Dropdown" 
        options={mockOptions} 
        required 
      />
    );
    
    // Check if required indicator is displayed
    const requiredIndicator = screen.getByText('*');
    expect(requiredIndicator).toBeInTheDocument();
    expect(requiredIndicator).toHaveClass('text-red-500');
  });
  
  test('applies full width class when fullWidth is true', () => {
    render(
      <Dropdown 
        label="Test Dropdown" 
        options={mockOptions} 
        fullWidth 
      />
    );
    
    // Check if container has full width class
    const container = screen.getByText('Test Dropdown').closest('div');
    expect(container).toHaveClass('w-full');
  });
  
  test('uses provided id for button and label association', () => {
    render(
      <Dropdown 
        label="Test Dropdown" 
        options={mockOptions} 
        id="custom-id" 
      />
    );
    
    // Check if button has the custom id
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('id', 'custom-id');
  });
  
  test('generates id from label when id is not provided', () => {
    render(
      <Dropdown 
        label="Generated ID" 
        options={mockOptions} 
      />
    );
    
    // Check if button has the generated id
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('id', 'dropdown-generated-id');
  });
  
  test('handles keyboard navigation', () => {
    render(
      <Dropdown 
        label="Test Dropdown" 
        options={mockOptions} 
      />
    );
    
    const button = screen.getByRole('button');
    
    // Press Enter to open dropdown
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    
    // Press Escape to close dropdown
    fireEvent.keyDown(button, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    
    // Press Space to open dropdown
    fireEvent.keyDown(button, { key: ' ' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    
    // Press ArrowDown to open dropdown (when closed)
    fireEvent.keyDown(button, { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
  
  test('has no accessibility violations', async () => {
    const { container } = render(
      <Dropdown 
        label="Accessible Dropdown" 
        options={mockOptions} 
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('has no accessibility violations when open', async () => {
    const { container } = render(
      <Dropdown 
        label="Accessible Dropdown" 
        options={mockOptions} 
      />
    );
    
    // Open the dropdown
    fireEvent.click(screen.getByRole('button'));
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('has no accessibility violations with error', async () => {
    const { container } = render(
      <Dropdown 
        label="Accessible Dropdown" 
        options={mockOptions} 
        error="This is an error message" 
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
