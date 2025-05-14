import React from 'react';
import { Box, useColorMode } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';

export interface ApiServiceProps {
  baseUrl?: string;
  endpoints?: {
    [key: string]: string;
  };
}

class ApiService {
  private baseUrl: string;
  private endpoints: {
    [key: string]: string;
  };

  constructor({ baseUrl = 'http://localhost:3000/api', endpoints = {} }: ApiServiceProps = {}) {
    this.baseUrl = baseUrl;
    this.endpoints = {
      tasks: '/tasks',
      status: '/status',
      analytics: '/analytics',
      ...endpoints
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Tasks API
  async getTasks() {
    return this.request(this.endpoints.tasks);
  }

  async getTaskById(id: string) {
    return this.request(`${this.endpoints.tasks}/${id}`);
  }

  async createTask(data: any) {
    return this.request(this.endpoints.tasks, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: any) {
    return this.request(`${this.endpoints.tasks}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string) {
    return this.request(`${this.endpoints.tasks}/${id}`, {
      method: 'DELETE',
    });
  }

  // System Status API
  async getSystemStatus() {
    return this.request(this.endpoints.status);
  }

  // Analytics API
  async getAnalytics() {
    return this.request(this.endpoints.analytics);
  }
}

export default ApiService;
