/**
 * ALT_LAS API Gateway Service
 *
 * This service provides a unified interface for interacting with the ALT_LAS API Gateway.
 * It handles authentication, request formatting, error handling, and provides
 * type-safe methods for all API endpoints.
 */

export interface ApiServiceProps {
  baseUrl?: string;
  endpoints?: {
    [key: string]: string;
  };
  authToken?: string;
  timeout?: number;
}

/**
 * Error types for API responses
 */
export enum ApiErrorType {
  NETWORK = 'NETWORK_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  SERVER = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR'
}

/**
 * Custom API error class
 */
export class ApiError extends Error {
  type: ApiErrorType;
  statusCode?: number;
  details?: any;

  constructor(message: string, type: ApiErrorType = ApiErrorType.UNKNOWN, statusCode?: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Main API Service class
 */
class ApiService {
  private baseUrl: string;
  private endpoints: {
    [key: string]: string;
  };
  private authToken?: string;
  private timeout: number;

  constructor({
    baseUrl = 'http://localhost:3000/api',
    endpoints = {},
    authToken,
    timeout = 30000 // 30 seconds default timeout
  }: ApiServiceProps = {}) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
    this.timeout = timeout;
    this.endpoints = {
      // Authentication
      login: '/auth/login',
      logout: '/auth/logout',
      refreshToken: '/auth/refresh',

      // Tasks
      tasks: '/tasks',

      // Segmentation
      segmentation: '/segmentation',
      models: '/segmentation/models',

      // Runner
      runner: '/runner',
      runnerStatus: '/runner/status',

      // Archive
      archive: '/archive',
      archiveSearch: '/archive/search',

      // System
      status: '/status',
      analytics: '/analytics',

      // Custom endpoints
      ...endpoints
    };
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string | undefined) {
    this.authToken = token;
  }

  /**
   * Get current authentication token
   */
  getAuthToken(): string | undefined {
    return this.authToken;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    this.authToken = undefined;
  }

  /**
   * Make an API request with timeout and error handling
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add auth token if available
    if (this.authToken) {
      defaultHeaders['Authorization'] = `Bearer ${this.authToken}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    };

    // Create an AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      // Clear timeout
      clearTimeout(timeoutId);

      // Handle different error responses
      if (!response.ok) {
        let errorType = ApiErrorType.UNKNOWN;
        let errorMessage = `HTTP Error: ${response.status}`;
        let errorDetails = null;

        // Try to parse error response
        try {
          errorDetails = await response.json();
          errorMessage = errorDetails.message || errorMessage;
        } catch (e) {
          // If we can't parse JSON, use text content if available
          try {
            const textContent = await response.text();
            if (textContent) errorMessage = textContent;
          } catch (textError) {
            // Ignore text parsing errors
          }
        }

        // Map HTTP status codes to error types
        switch (response.status) {
          case 400:
            errorType = ApiErrorType.VALIDATION;
            break;
          case 401:
            errorType = ApiErrorType.AUTHENTICATION;
            break;
          case 403:
            errorType = ApiErrorType.AUTHORIZATION;
            break;
          case 404:
            errorType = ApiErrorType.NOT_FOUND;
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorType = ApiErrorType.SERVER;
            break;
          default:
            errorType = ApiErrorType.UNKNOWN;
        }

        throw new ApiError(
          errorMessage,
          errorType,
          response.status,
          errorDetails
        );
      }

      // Handle empty responses
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
      }

      // Parse JSON response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data as T;
      } else {
        // Handle non-JSON responses
        const text = await response.text();
        try {
          // Try to parse as JSON anyway
          return JSON.parse(text) as T;
        } catch (e) {
          // Return text as is
          return text as unknown as T;
        }
      }
    } catch (error) {
      // Clear timeout
      clearTimeout(timeoutId);

      // Handle specific error types
      if (error instanceof ApiError) {
        // Re-throw ApiError instances
        throw error;
      } else if (error instanceof DOMException && error.name === 'AbortError') {
        // Handle timeout
        throw new ApiError(
          'Request timed out',
          ApiErrorType.TIMEOUT
        );
      } else {
        // Handle network and other errors
        console.error('API request failed:', error);
        throw new ApiError(
          error instanceof Error ? error.message : 'Network error',
          ApiErrorType.NETWORK
        );
      }
    }
  }

  // Authentication API

  /**
   * Login with username and password
   */
  async login(username: string, password: string): Promise<{ token: string; user: any }> {
    const result = await this.request<{ token: string; user: any }>(this.endpoints.login, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    // Store the token
    if (result.token) {
      this.setAuthToken(result.token);
    }

    return result;
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await this.request<void>(this.endpoints.logout, {
        method: 'POST',
      });
    } finally {
      // Always clear token even if request fails
      this.clearAuthToken();
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<{ token: string }> {
    const result = await this.request<{ token: string }>(this.endpoints.refreshToken, {
      method: 'POST',
    });

    // Store the new token
    if (result.token) {
      this.setAuthToken(result.token);
    }

    return result;
  }

  // Tasks API

  /**
   * Get all tasks
   */
  async getTasks<T = any>(): Promise<T[]> {
    return this.request<T[]>(this.endpoints.tasks);
  }

  /**
   * Get task by ID
   */
  async getTaskById<T = any>(id: string): Promise<T> {
    return this.request<T>(`${this.endpoints.tasks}/${id}`);
  }

  /**
   * Create a new task
   */
  async createTask<T = any, D = any>(data: D): Promise<T> {
    return this.request<T>(this.endpoints.tasks, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing task
   */
  async updateTask<T = any, D = any>(id: string, data: D): Promise<T> {
    return this.request<T>(`${this.endpoints.tasks}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    return this.request<void>(`${this.endpoints.tasks}/${id}`, {
      method: 'DELETE',
    });
  }

  // Segmentation API

  /**
   * Get available segmentation models
   */
  async getSegmentationModels<T = any>(): Promise<T[]> {
    return this.request<T[]>(this.endpoints.models);
  }

  /**
   * Run segmentation on an image
   */
  async runSegmentation<T = any>(imageData: Blob, modelId: string, options?: any): Promise<T> {
    const formData = new FormData();
    formData.append('image', imageData);
    formData.append('modelId', modelId);

    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    return this.request<T>(this.endpoints.segmentation, {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
        'Content-Type': undefined as any,
      },
    });
  }

  // Runner API

  /**
   * Get runner status
   */
  async getRunnerStatus<T = any>(): Promise<T> {
    return this.request<T>(this.endpoints.runnerStatus);
  }

  /**
   * Start a runner job
   */
  async startRunnerJob<T = any, D = any>(data: D): Promise<T> {
    return this.request<T>(this.endpoints.runner, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Stop a runner job
   */
  async stopRunnerJob(jobId: string): Promise<void> {
    return this.request<void>(`${this.endpoints.runner}/${jobId}/stop`, {
      method: 'POST',
    });
  }

  // Archive API

  /**
   * Search archive
   */
  async searchArchive<T = any>(query: string, filters?: any): Promise<T[]> {
    return this.request<T[]>(this.endpoints.archiveSearch, {
      method: 'POST',
      body: JSON.stringify({ query, ...filters }),
    });
  }

  /**
   * Get archive item by ID
   */
  async getArchiveItem<T = any>(id: string): Promise<T> {
    return this.request<T>(`${this.endpoints.archive}/${id}`);
  }

  // System API

  /**
   * Get system status
   */
  async getSystemStatus<T = any>(): Promise<T> {
    return this.request<T>(this.endpoints.status);
  }

  /**
   * Get system analytics
   */
  async getAnalytics<T = any>(): Promise<T> {
    return this.request<T>(this.endpoints.analytics);
  }
}

export default ApiService;
