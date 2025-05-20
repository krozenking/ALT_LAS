// src/__tests__/a11y/comprehensive-a11y.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { Dropdown } from '../../components/Dropdown';
import { Checkbox } from '../../components/Checkbox';
import { LoginForm } from '../../components/LoginForm';
import { Form } from '../../components/Form';
import { 
  testA11y, 
  renderWithA11y, 
  wcag2aaConfig, 
  keyboardNavigation 
} from '../../utils/a11y-test-utils';

describe('Comprehensive Accessibility Tests', () => {
  describe('Button Component', () => {
    test('meets WCAG 2.1 AA standards', async () => {
      await testA11y(<Button>Accessible Button</Button>, wcag2aaConfig);
    });
    
    test('is keyboard accessible', () => {
      render(<Button>Keyboard Accessible Button</Button>);
      
      // Focus the button
      const button = screen.getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);
      
      // Press Enter to click the button
      const handleClick = jest.fn();
      button.onclick = handleClick;
      keyboardNavigation.enter();
      expect(handleClick).toHaveBeenCalled();
      
      // Press Space to click the button
      handleClick.mockClear();
      keyboardNavigation.space();
      expect(handleClick).toHaveBeenCalled();
    });
    
    test('has appropriate ARIA attributes when disabled', async () => {
      const { container } = render(<Button disabled>Disabled Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toBeDisabled();
      
      // Check for accessibility violations
      const results = await axe(container, wcag2aaConfig);
      expect(results).toHaveNoViolations();
    });
    
    test('has appropriate contrast ratio', async () => {
      const { container } = render(
        <div>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="tertiary">Tertiary Button</Button>
        </div>
      );
      
      // Check for color contrast violations
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
      
      expect(results).toHaveNoViolations();
    });
  });
  
  describe('TextField Component', () => {
    test('meets WCAG 2.1 AA standards', async () => {
      await testA11y(<TextField label="Accessible TextField" />, wcag2aaConfig);
    });
    
    test('has properly associated label', () => {
      render(<TextField label="Username" />);
      
      const textField = screen.getByLabelText('Username');
      expect(textField).toBeInTheDocument();
      
      // The label's for attribute should match the input's id
      const label = screen.getByText('Username');
      const input = screen.getByRole('textbox');
      expect(label).toHaveAttribute('for', input.id);
    });
    
    test('has appropriate ARIA attributes for error state', async () => {
      const { container } = render(
        <TextField 
          label="Email" 
          error="Invalid email format" 
        />
      );
      
      const textField = screen.getByLabelText('Email');
      expect(textField).toHaveAttribute('aria-invalid', 'true');
      
      const errorMessage = screen.getByText('Invalid email format');
      expect(errorMessage).toHaveAttribute('role', 'alert');
      expect(textField).toHaveAttribute('aria-describedby', expect.stringContaining('-error'));
      
      // Check for accessibility violations
      const results = await axe(container, wcag2aaConfig);
      expect(results).toHaveNoViolations();
    });
    
    test('is keyboard navigable', () => {
      render(
        <div>
          <TextField label="First Name" />
          <TextField label="Last Name" />
        </div>
      );
      
      // Focus the first input
      const firstInput = screen.getByLabelText('First Name');
      firstInput.focus();
      expect(document.activeElement).toBe(firstInput);
      
      // Tab to the next input
      keyboardNavigation.tab();
      const secondInput = screen.getByLabelText('Last Name');
      expect(document.activeElement).toBe(secondInput);
    });
  });
  
  describe('Dropdown Component', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ];
    
    test('meets WCAG 2.1 AA standards', async () => {
      await testA11y(
        <Dropdown 
          label="Accessible Dropdown" 
          options={options} 
        />, 
        wcag2aaConfig
      );
    });
    
    test('has appropriate ARIA attributes', () => {
      render(
        <Dropdown 
          label="Select Option" 
          options={options} 
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      
      // Open the dropdown
      fireEvent.click(button);
      
      expect(button).toHaveAttribute('aria-expanded', 'true');
      
      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-controls', listbox.id);
      
      // Check options
      const option1 = screen.getByText('Option 1');
      expect(option1.closest('li')).toHaveAttribute('role', 'option');
    });
    
    test('is keyboard navigable', () => {
      render(
        <Dropdown 
          label="Select Option" 
          options={options} 
        />
      );
      
      // Focus the dropdown button
      const button = screen.getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);
      
      // Press Enter to open dropdown
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      
      // Press Escape to close dropdown
      fireEvent.keyDown(button, { key: 'Escape' });
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      
      // Press Space to open dropdown
      fireEvent.keyDown(button, { key: ' ' });
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      
      // Press ArrowDown to navigate options
      fireEvent.keyDown(button, { key: 'ArrowDown' });
      // In a real implementation, this would focus the first option
    });
  });
  
  describe('Checkbox Component', () => {
    test('meets WCAG 2.1 AA standards', async () => {
      await testA11y(
        <Checkbox 
          label="Accessible Checkbox" 
        />, 
        wcag2aaConfig
      );
    });
    
    test('has properly associated label', () => {
      render(<Checkbox label="Accept Terms" />);
      
      const checkbox = screen.getByLabelText('Accept Terms');
      expect(checkbox).toBeInTheDocument();
      
      // The label's for attribute should match the checkbox's id
      const label = screen.getByText('Accept Terms');
      const input = screen.getByRole('checkbox');
      expect(label).toHaveAttribute('for', input.id);
    });
    
    test('is keyboard accessible', () => {
      render(<Checkbox label="Accept Terms" />);
      
      // Focus the checkbox
      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      expect(document.activeElement).toBe(checkbox);
      
      // Press Space to check the checkbox
      expect(checkbox).not.toBeChecked();
      keyboardNavigation.space();
      expect(checkbox).toBeChecked();
    });
  });
  
  describe('Form Components', () => {
    test('LoginForm meets WCAG 2.1 AA standards', async () => {
      await testA11y(
        <LoginForm onSubmit={jest.fn()} />, 
        wcag2aaConfig
      );
    });
    
    test('Form meets WCAG 2.1 AA standards', async () => {
      await testA11y(
        <Form onSubmit={jest.fn()} />, 
        wcag2aaConfig
      );
    });
    
    test('Form validation errors are properly associated with inputs', async () => {
      const { container } = render(<Form onSubmit={jest.fn()} />);
      
      // Submit the form without filling it out
      fireEvent.click(screen.getByRole('button', { name: /gönder/i }));
      
      // Check if error messages are properly associated with inputs
      const nameInput = screen.getByLabelText(/isim/i);
      const nameError = screen.getByText(/isim alanı zorunludur/i);
      
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      expect(nameInput).toHaveAttribute('aria-describedby', expect.stringContaining('-error'));
      
      // Check for accessibility violations
      const results = await axe(container, wcag2aaConfig);
      expect(results).toHaveNoViolations();
    });
  });
});
