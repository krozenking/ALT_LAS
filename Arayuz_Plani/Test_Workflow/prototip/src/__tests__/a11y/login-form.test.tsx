// src/__tests__/a11y/login-form.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { LoginForm } from '../../components/LoginForm';

describe('LoginForm Accessibility', () => {
  test('login form has no accessibility violations', async () => {
    const { container } = render(<LoginForm onSubmit={jest.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('login form with error has no accessibility violations', async () => {
    const { container } = render(
      <LoginForm 
        onSubmit={jest.fn()} 
        error="Invalid username or password" 
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('login form in loading state has no accessibility violations', async () => {
    const { container } = render(
      <LoginForm 
        onSubmit={jest.fn()} 
        isLoading={true} 
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('login form with validation errors has no accessibility violations', async () => {
    const { container, getByRole } = render(<LoginForm onSubmit={jest.fn()} />);
    
    // Submit the form to trigger validation errors
    const submitButton = getByRole('button', { name: /log in/i });
    submitButton.click();
    
    // Check for accessibility violations
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
