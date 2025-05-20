// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { TextField } from './TextField';
import { Button } from './Button';

interface LoginFormProps {
  onSubmit: (username: string, password: string) => void;
  isLoading?: boolean;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    let isValid = true;
    
    if (!username) {
      setUsernameError('Username is required');
      isValid = false;
    } else {
      setUsernameError(undefined);
    }
    
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    } else {
      setPasswordError(undefined);
    }
    
    if (isValid) {
      onSubmit(username, password);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label="Login form">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md" role="alert">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <TextField
        label="Username"
        value={username}
        onChange={setUsername}
        required
        error={usernameError}
        fullWidth
      />
      
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        required
        error={passwordError}
        helperText="Must be at least 8 characters"
        fullWidth
      />
      
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Log in'}
        </Button>
      </div>
    </form>
  );
};
