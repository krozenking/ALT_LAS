// src/services/serviceDiscovery.ts
import { config } from '../config';

/**
 * Service discovery interface
 */
export interface ServiceDiscovery {
  /**
   * Get the URL for a specific service
   * @param serviceName The name of the service
   * @returns The URL of the service
   * @throws Error if service is not found
   */
  getServiceUrl(serviceName: string): string;
  
  /**
   * Check if a service is available
   * @param serviceName The name of the service
   * @returns True if the service is available, false otherwise
   */
  isServiceAvailable(serviceName: string): boolean;
}

/**
 * Configuration-based service discovery implementation
 */
export class ConfigServiceDiscovery implements ServiceDiscovery {
  private serviceUrls: Record<string, string>;
  private availableServices: Set<string>;
  
  constructor() {
    this.serviceUrls = {
      segmentation: config.services.segmentation,
      runner: config.services.runner,
      archive: config.services.archive,
      // Add other services as needed
    };
    
    // Initially all configured services are considered available
    this.availableServices = new Set(Object.keys(this.serviceUrls));
  }
  
  /**
   * Get the URL for a specific service
   * @param serviceName The name of the service
   * @returns The URL of the service
   * @throws Error if service is not found
   */
  getServiceUrl(serviceName: string): string {
    const url = this.serviceUrls[serviceName];
    if (!url) {
      throw new Error(`Service '${serviceName}' not found in configuration`);
    }
    return url;
  }
  
  /**
   * Check if a service is available
   * @param serviceName The name of the service
   * @returns True if the service is available, false otherwise
   */
  isServiceAvailable(serviceName: string): boolean {
    return this.availableServices.has(serviceName);
  }
  
  /**
   * Mark a service as unavailable
   * @param serviceName The name of the service
   */
  markServiceUnavailable(serviceName: string): void {
    this.availableServices.delete(serviceName);
    console.warn(`Service '${serviceName}' marked as unavailable`);
  }
  
  /**
   * Mark a service as available
   * @param serviceName The name of the service
   */
  markServiceAvailable(serviceName: string): void {
    if (this.serviceUrls[serviceName]) {
      this.availableServices.add(serviceName);
      console.info(`Service '${serviceName}' marked as available`);
    }
  }
  
  /**
   * Get all available services
   * @returns Array of available service names
   */
  getAvailableServices(): string[] {
    return Array.from(this.availableServices);
  }
}

// Export a singleton instance
export const serviceDiscovery = new ConfigServiceDiscovery();
