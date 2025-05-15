import cacheService, { CacheOptions } from './CacheService';

/**
 * API request options
 */
export interface ApiRequestOptions extends RequestInit {
  /**
   * Base URL for the request
   */
  baseUrl?: string;
  /**
   * Cache options
   */
  cache?: CacheOptions;
  /**
   * Whether to use cache
   */
  useCache?: boolean;
  /**
   * Request timeout in milliseconds
   */
  timeout?: number;
  /**
   * Whether to include credentials
   */
  withCredentials?: boolean;
  /**
   * Whether to retry on failure
   */
  retry?: boolean;
  /**
   * Maximum number of retry attempts
   */
  maxRetries?: number;
  /**
   * Retry delay in milliseconds
   */
  retryDelay?: number;
  /**
   * Retry backoff factor
   */
  retryBackoffFactor?: number;
  /**
   * Whether to handle errors automatically
   */
  handleErrors?: boolean;
  /**
   * Whether to parse response as JSON
   */
  parseJson?: boolean;
  /**
   * Whether to abort request on component unmount
   */
  abortOnUnmount?: boolean;
}

/**
 * Default API request options
 */
const DEFAULT_OPTIONS: ApiRequestOptions = {
  baseUrl: '',
  useCache: false,
  cache: {
    ttl: 5 * 60 * 1000, // 5 minutes
    tags: [],
    persist: false,
    updateExpiryOnGet: false,
  },
  timeout: 30000, // 30 seconds
  withCredentials: true,
  retry: true,
  maxRetries: 3,
  retryDelay: 1000,
  retryBackoffFactor: 2,
  handleErrors: true,
  parseJson: true,
  abortOnUnmount: true,
};

/**
 * API service for making HTTP requests
 */
class ApiService {
  private baseUrl: string = '';
  private defaultOptions: ApiRequestOptions = DEFAULT_OPTIONS;
  private abortControllers: Map<string, AbortController> = new Map();

  /**
   * Constructor
   * @param baseUrl Base URL for all requests
   * @param defaultOptions Default options for all requests
   */
  constructor(baseUrl: string = '', defaultOptions: Partial<ApiRequestOptions> = {}) {
    this.baseUrl = baseUrl;
    this.defaultOptions = { ...DEFAULT_OPTIONS, ...defaultOptions, baseUrl };
  }

  /**
   * Set base URL
   * @param baseUrl Base URL for all requests
   */
  public setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
    this.defaultOptions.baseUrl = baseUrl;
  }

  /**
   * Set default options
   * @param options Default options for all requests
   */
  public setDefaultOptions(options: Partial<ApiRequestOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  /**
   * Make GET request
   * @param url Request URL
   * @param options Request options
   * @returns Promise with response data
   */
  public async get<T = any>(url: string, options: Partial<ApiRequestOptions> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  /**
   * Make POST request
   * @param url Request URL
   * @param data Request body
   * @param options Request options
   * @returns Promise with response data
   */
  public async post<T = any>(url: string, data?: any, options: Partial<ApiRequestOptions> = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  /**
   * Make PUT request
   * @param url Request URL
   * @param data Request body
   * @param options Request options
   * @returns Promise with response data
   */
  public async put<T = any>(url: string, data?: any, options: Partial<ApiRequestOptions> = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  /**
   * Make PATCH request
   * @param url Request URL
   * @param data Request body
   * @param options Request options
   * @returns Promise with response data
   */
  public async patch<T = any>(url: string, data?: any, options: Partial<ApiRequestOptions> = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  /**
   * Make DELETE request
   * @param url Request URL
   * @param options Request options
   * @returns Promise with response data
   */
  public async delete<T = any>(url: string, options: Partial<ApiRequestOptions> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  /**
   * Invalidate cache by tags
   * @param tags Tags to invalidate
   */
  public invalidateCache(tags: string[]): void {
    cacheService.invalidateByTags(tags);
  }

  /**
   * Clear all cache
   */
  public clearCache(): void {
    cacheService.clear();
  }

  /**
   * Abort all pending requests
   */
  public abortAll(): void {
    this.abortControllers.forEach((controller) => {
      controller.abort();
    });
    this.abortControllers.clear();
  }

  /**
   * Abort request by ID
   * @param requestId Request ID
   */
  public abort(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * Make HTTP request
   * @param url Request URL
   * @param options Request options
   * @returns Promise with response data
   */
  private async request<T = any>(url: string, options: Partial<ApiRequestOptions> = {}): Promise<T> {
    // Merge options with defaults
    const opts: ApiRequestOptions = { ...this.defaultOptions, ...options };
    const { baseUrl, useCache, cache, timeout, withCredentials, retry, maxRetries, retryDelay, retryBackoffFactor, handleErrors, parseJson, abortOnUnmount, ...fetchOptions } = opts;

    // Build full URL
    const fullUrl = this.buildUrl(url, baseUrl);

    // Generate cache key
    const cacheKey = this.generateCacheKey(fullUrl, fetchOptions);

    // Check cache
    if (useCache && opts.method === 'GET') {
      const cachedData = cacheService.get<T>(cacheKey, cache);
      if (cachedData) {
        return cachedData;
      }
    }

    // Create abort controller
    const controller = new AbortController();
    const requestId = Math.random().toString(36).substring(2, 11);
    this.abortControllers.set(requestId, controller);

    // Set up timeout
    const timeoutId = timeout ? setTimeout(() => {
      controller.abort();
      this.abortControllers.delete(requestId);
    }, timeout) : null;

    try {
      // Make request
      const response = await this.fetchWithRetry<T>(fullUrl, {
        ...fetchOptions,
        signal: controller.signal,
        credentials: withCredentials ? 'include' : undefined,
      }, { retry, maxRetries, retryDelay, retryBackoffFactor, handleErrors, parseJson });

      // Cache response if needed
      if (useCache && opts.method === 'GET') {
        cacheService.set(cacheKey, response, cache);
      }

      return response;
    } finally {
      // Clean up
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * Fetch with retry
   * @param url Request URL
   * @param options Fetch options
   * @param retryOptions Retry options
   * @returns Promise with response data
   */
  private async fetchWithRetry<T = any>(
    url: string,
    options: RequestInit,
    retryOptions: {
      retry: boolean;
      maxRetries: number;
      retryDelay: number;
      retryBackoffFactor: number;
      handleErrors: boolean;
      parseJson: boolean;
    }
  ): Promise<T> {
    const { retry, maxRetries, retryDelay, retryBackoffFactor, handleErrors, parseJson } = retryOptions;
    let retries = 0;
    let lastError: Error | null = null;

    while (retries <= maxRetries) {
      try {
        const response = await fetch(url, options);

        // Handle HTTP errors
        if (!response.ok && handleErrors) {
          const errorText = await response.text();
          throw new Error(`HTTP error ${response.status}: ${errorText}`);
        }

        // Parse response
        if (parseJson) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return await response.json();
          }
        }

        return await response.text() as unknown as T;
      } catch (error) {
        lastError = error as Error;

        // Don't retry if aborted
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw error;
        }

        // Don't retry if max retries reached or retry is disabled
        if (!retry || retries >= maxRetries) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = retryDelay * Math.pow(retryBackoffFactor, retries);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
      }
    }

    throw lastError;
  }

  /**
   * Build full URL
   * @param url Request URL
   * @param baseUrl Base URL
   * @returns Full URL
   */
  private buildUrl(url: string, baseUrl?: string): string {
    // If URL is absolute, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Use provided base URL or default
    const base = baseUrl || this.baseUrl;

    // Join base URL and path
    return `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  }

  /**
   * Generate cache key
   * @param url Request URL
   * @param options Request options
   * @returns Cache key
   */
  private generateCacheKey(url: string, options: RequestInit): string {
    const { method, headers, body } = options;
    return `${method || 'GET'}_${url}_${JSON.stringify(headers)}_${body || ''}`;
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
