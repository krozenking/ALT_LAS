import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Basic validation for essential environment variables
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1);
}

export const config = {
  port: process.env.PORT || 3000,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h', // Default to 1 hour
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // Default to 7 days
  },
  // Add other configurations as needed (database, logging, etc.)
};

