import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Basic validation for essential environment variables
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1);
}

// Helper function to ensure URL format
const ensureUrlFormat = (url: string | undefined, defaultUrl: string): string => {
  if (!url) return defaultUrl;
  // Basic check if it starts with http:// or https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.warn(`Invalid URL format for service: ${url}. Using default: ${defaultUrl}`);
    return defaultUrl;
  }
  // Remove trailing slash if present
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

export const config = {
  port: process.env.PORT || 3000,
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h', // Default to 1 hour
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // Default to 7 days
  },
  services: {
    segmentation: ensureUrlFormat(process.env.SEGMENTATION_SERVICE_URL, 'http://localhost:8001'),
    runner: ensureUrlFormat(process.env.RUNNER_SERVICE_URL, 'http://localhost:8002'),
    archive: ensureUrlFormat(process.env.ARCHIVE_SERVICE_URL, 'http://localhost:8003'),
    'ai-orchestrator': ensureUrlFormat(process.env.AI_ORCHESTRATOR_URL, 'http://localhost:8004'),
    // Add other service URLs as needed
  },
  // Add other configurations as needed (database, logging, etc.)
};

console.log('Service Configuration:');
console.log(`- Segmentation Service: ${config.services.segmentation}`);
console.log(`- Runner Service: ${config.services.runner}`);
console.log(`- Archive Service: ${config.services.archive}`);
console.log(`- AI Orchestrator Service: ${config.services['ai-orchestrator']}`);

