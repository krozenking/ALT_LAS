import { useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  [key: string]: any;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface UseAuthResult {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => string | null;
}

/**
 * Hook to manage authentication state
 */
export const useAuth = (): UseAuthResult => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Load auth state from storage
  const loadAuthState = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, this would load from localStorage or a secure store
      // For now, we'll check if there's a token in localStorage
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        // In a real application, you would validate the token and get user info
        // For now, we'll use a mock user
        const mockUser: User = {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          roles: ['admin'],
        };

        setAuthState({
          isAuthenticated: true,
          user: mockUser,
          token,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load authentication state'));
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load auth state on mount
  useEffect(() => {
    loadAuthState();
  }, [loadAuthState]);

  // Login
  const login = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, this would call an API
      // For now, we'll use a mock login
      if (username === 'admin' && password === 'password') {
        const mockUser: User = {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          roles: ['admin'],
        };
        const mockToken = 'mock_token_' + Date.now();

        // Save token to localStorage
        localStorage.setItem('auth_token', mockToken);

        setAuthState({
          isAuthenticated: true,
          user: mockUser,
          token: mockToken,
        });
      } else {
        throw new Error('Invalid username or password');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Login failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, this would call an API
      // For now, we'll just clear localStorage
      localStorage.removeItem('auth_token');

      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Logout failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get token
  const getToken = (): string | null => {
    return authState.token;
  };

  return {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    isLoading,
    error,
    login,
    logout,
    getToken,
  };
};

export default useAuth;
