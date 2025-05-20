// src/__tests__/integration/login-flow.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../../components/LoginForm';

// Mock a simple login page component that uses the LoginForm
const LoginPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();
  
  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    setError(undefined);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simple validation for testing
    if (username === 'admin' && password === 'password123') {
      setIsLoggedIn(true);
      setIsLoading(false);
    } else {
      setError('Invalid username or password');
      setIsLoading(false);
    }
  };
  
  if (isLoggedIn) {
    return (
      <div>
        <h1>Welcome, Admin!</h1>
        <p>You are now logged in.</p>
        <button onClick={() => setIsLoggedIn(false)}>Log out</button>
      </div>
    );
  }
  
  return (
    <div>
      <h1>Login</h1>
      <LoginForm 
        onSubmit={handleLogin} 
        isLoading={isLoading} 
        error={error} 
      />
    </div>
  );
};

describe('Login Flow Integration', () => {
  test('successful login flow', async () => {
    render(<LoginPage />);
    
    // Check initial state
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    
    // Enter valid credentials
    userEvent.type(screen.getByLabelText(/username/i), 'admin');
    userEvent.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    // Check loading state
    expect(screen.getByRole('button', { name: /logging in/i })).toBeInTheDocument();
    
    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome, admin/i })).toBeInTheDocument();
    });
    
    // Check logged in state
    expect(screen.getByText(/you are now logged in/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
  });
  
  test('failed login flow with incorrect credentials', async () => {
    render(<LoginPage />);
    
    // Enter invalid credentials
    userEvent.type(screen.getByLabelText(/username/i), 'wronguser');
    userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    // Check loading state
    expect(screen.getByRole('button', { name: /logging in/i })).toBeInTheDocument();
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
    });
    
    // Check that we're still on the login page
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
  
  test('validation prevents submission with empty fields', async () => {
    render(<LoginPage />);
    
    // Submit the form without entering any data
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    // Check validation errors
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
    
    // Check that we're still on the login page
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });
  
  test('validation prevents submission with short password', async () => {
    render(<LoginPage />);
    
    // Enter username but short password
    userEvent.type(screen.getByLabelText(/username/i), 'admin');
    userEvent.type(screen.getByLabelText(/password/i), 'short');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    // Check validation error
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
    
    // Check that we're still on the login page
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });
  
  test('complete login flow with logout', async () => {
    render(<LoginPage />);
    
    // Enter valid credentials
    userEvent.type(screen.getByLabelText(/username/i), 'admin');
    userEvent.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome, admin/i })).toBeInTheDocument();
    });
    
    // Log out
    fireEvent.click(screen.getByRole('button', { name: /log out/i }));
    
    // Check that we're back on the login page
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
});
