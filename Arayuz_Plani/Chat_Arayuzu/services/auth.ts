/**
 * Authentication service for user authentication and session management
 */

import { User } from '../types';

// Token response
interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Login credentials
interface LoginCredentials {
  email: string;
  password: string;
}

// Registration data
interface RegistrationData {
  name: string;
  email: string;
  password: string;
}

// Authentication service
class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiration: number | null = null;
  private currentUser: User | null = null;
  private refreshTokenTimeout: NodeJS.Timeout | null = null;
  
  // API base URL
  private API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  private constructor() {
    // Load tokens from local storage
    this.loadTokens();
    
    // Set up token refresh
    this.setupTokenRefresh();
  }
  
  // Get instance (singleton)
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  
  // Load tokens from local storage
  private loadTokens(): void {
    try {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const tokenExpiration = localStorage.getItem('token_expiration');
      
      if (accessToken && refreshToken && tokenExpiration) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenExpiration = parseInt(tokenExpiration, 10);
        
        // Load current user
        const currentUser = localStorage.getItem('current_user');
        if (currentUser) {
          this.currentUser = JSON.parse(currentUser);
        }
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  }
  
  // Save tokens to local storage
  private saveTokens(tokens: TokenResponse, user: User): void {
    try {
      this.accessToken = tokens.accessToken;
      this.refreshToken = tokens.refreshToken;
      this.tokenExpiration = Date.now() + tokens.expiresIn * 1000;
      this.currentUser = user;
      
      localStorage.setItem('access_token', tokens.accessToken);
      localStorage.setItem('refresh_token', tokens.refreshToken);
      localStorage.setItem('token_expiration', this.tokenExpiration.toString());
      localStorage.setItem('current_user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  }
  
  // Clear tokens from local storage
  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiration = null;
    this.currentUser = null;
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiration');
    localStorage.removeItem('current_user');
    
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
      this.refreshTokenTimeout = null;
    }
  }
  
  // Set up token refresh
  private setupTokenRefresh(): void {
    if (this.tokenExpiration) {
      const timeUntilExpiration = this.tokenExpiration - Date.now();
      
      if (timeUntilExpiration > 0) {
        // Refresh token 5 minutes before expiration
        const refreshTime = Math.max(0, timeUntilExpiration - 5 * 60 * 1000);
        
        this.refreshTokenTimeout = setTimeout(() => {
          this.refreshAccessToken();
        }, refreshTime);
      } else {
        // Token already expired, refresh now
        this.refreshAccessToken();
      }
    }
  }
  
  // Refresh access token
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      return;
    }
    
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Save new tokens
      this.accessToken = data.accessToken;
      this.tokenExpiration = Date.now() + data.expiresIn * 1000;
      
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('token_expiration', this.tokenExpiration.toString());
      
      // Set up next token refresh
      this.setupTokenRefresh();
    } catch (error) {
      console.error('Error refreshing token:', error);
      
      // Clear tokens on refresh error
      this.clearTokens();
    }
  }
  
  // Login
  public async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Save tokens
      this.saveTokens(data.tokens, data.user);
      
      // Set up token refresh
      this.setupTokenRefresh();
      
      return data.user;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }
  
  // Register
  public async register(registrationData: RegistrationData): Promise<User> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Save tokens
      this.saveTokens(data.tokens, data.user);
      
      // Set up token refresh
      this.setupTokenRefresh();
      
      return data.user;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  }
  
  // Logout
  public async logout(): Promise<void> {
    if (!this.refreshToken) {
      return;
    }
    
    try {
      await fetch(`${this.API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      // Clear tokens
      this.clearTokens();
    }
  }
  
  // Get current user
  public getCurrentUser(): User | null {
    return this.currentUser;
  }
  
  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!this.accessToken && !!this.tokenExpiration && this.tokenExpiration > Date.now();
  }
  
  // Get access token
  public getAccessToken(): string | null {
    return this.accessToken;
  }
  
  // Get authorization header
  public getAuthorizationHeader(): { Authorization: string } | {} {
    if (this.accessToken) {
      return { Authorization: `Bearer ${this.accessToken}` };
    }
    return {};
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
