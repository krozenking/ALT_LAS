// src/components/__tests__/LoginForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { LoginForm } from '../LoginForm';

describe('LoginForm Component', () => {
  test('renders login form with username and password fields', () => {
    render(<LoginForm onSubmit={jest.fn()} />);
    
    // Check if form elements are rendered
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });
  
  test('shows validation errors when submitting empty form', async () => {
    render(<LoginForm onSubmit={jest.fn()} />);
    
    // Submit the form without entering any data
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });
  
  test('shows password length validation error', async () => {
    render(<LoginForm onSubmit={jest.fn()} />);
    
    // Enter username but short password
    userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    userEvent.type(screen.getByLabelText(/password/i), 'short');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    // Check if password validation error is displayed
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });
  
  test('calls onSubmit with username and password when form is valid', async () => {
    const handleSubmit = jest.fn();
    render(<LoginForm onSubmit={handleSubmit} />);
    
    // Enter valid username and password
    userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    userEvent.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    // Check if onSubmit was called with correct values
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith('testuser', 'password123');
    });
  });
  
  test('displays loading state when isLoading is true', () => {
    render(<LoginForm onSubmit={jest.fn()} isLoading={true} />);
    
    // Check if button shows loading text
    expect(screen.getByRole('button', { name: /logging in/i })).toBeInTheDocument();
    
    // Check if button is disabled
    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
  });
  
  test('displays error message when error prop is provided', () => {
    render(<LoginForm onSubmit={jest.fn()} error="Invalid credentials" />);
    
    // Check if error message is displayed
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
  
  test('clears validation errors when valid input is provided', async () => {
    render(<LoginForm onSubmit={jest.fn()} />);
    
    // Submit empty form to trigger validation errors
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
    
    // Enter valid username and password
    userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    userEvent.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit the form again
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    // Check if validation errors are cleared
    await waitFor(() => {
      expect(screen.queryByText(/username is required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
    });
  });
  
  test('has no accessibility violations', async () => {
    const { container } = render(<LoginForm onSubmit={jest.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('has no accessibility violations with error', async () => {
    const { container } = render(<LoginForm onSubmit={jest.fn()} error="Invalid credentials" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
