// src/services/auth.ts

// API URL
const API_URL = 'https://api.alt-las.example';

// Types
export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LoginError {
  error: string;
}

// Auth service
export const authService = {
  // Login
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const errorData: LoginError = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }
    
    return response.json();
  },
  
  // Get user profile
  async getProfile(token: string): Promise<User> {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }
    
    return response.json();
  },
  
  // Logout
  async logout(token: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Logout failed');
    }
  },
};
