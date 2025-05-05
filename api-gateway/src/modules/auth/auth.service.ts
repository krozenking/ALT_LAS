import * as jwt from 'jsonwebtoken';
import { config } from '../../config';

export interface JwtPayload {
  userId: string;
  roles?: string[]; // Keep roles as string array, validation happens in middleware
  // Add other relevant payload data
}

// Simple in-memory store for blacklisted tokens (replace with Redis/DB in production)
const blacklistedTokens = new Set<string>();

// Custom function to parse time strings like '1h', '7d', '30m' into seconds
function parseTimeStringToSeconds(timeString: string | undefined): number | undefined {
    if (!timeString) return undefined;

    const timeRegex = /^(\d+)([smhd])$/;
    const match = timeString.match(timeRegex);

    if (!match) {
        console.warn(`Invalid time string format: ${timeString}. Expected format like '1h', '30m', '7d'.`);
        return undefined;
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case 's': return value;
        case 'm': return value * 60;
        case 'h': return value * 60 * 60;
        case 'd': return value * 60 * 60 * 24;
        default: return undefined;
    }
}

export class AuthService {
  // Ensure secret is treated as a string. The check in config/index.ts should guarantee it's not undefined.
  private readonly jwtSecret: jwt.Secret = config.jwt.secret!;
  // Convert time strings (e.g., '1h', '7d') to seconds using the custom function
  private readonly jwtExpiresInSeconds: number | undefined = parseTimeStringToSeconds(config.jwt.expiresIn);
  private readonly jwtRefreshExpiresInSeconds: number | undefined = parseTimeStringToSeconds(config.jwt.refreshExpiresIn);

  constructor() {
    // Validate conversion results
    if (config.jwt.expiresIn && this.jwtExpiresInSeconds === undefined) {
        console.warn(`Invalid JWT_EXPIRES_IN format: ${config.jwt.expiresIn}. Using default JWT expiration.`);
    }
    if (config.jwt.refreshExpiresIn && this.jwtRefreshExpiresInSeconds === undefined) {
        console.warn(`Invalid JWT_REFRESH_EXPIRES_IN format: ${config.jwt.refreshExpiresIn}. Using default JWT refresh expiration.`);
    }
  }

  /**
   * Generates a JWT access token.
   * @param payload - The payload to include in the token.
   * @returns The generated JWT access token.
   */
  generateAccessToken(payload: JwtPayload): string {
    // Add a unique identifier (jti) to the payload for blacklisting purposes
    const payloadWithJti = { ...payload, jti: this.generateJti() };
    // Explicitly provide SignOptions with expiresIn in seconds
    const options: jwt.SignOptions = {};
    if (this.jwtExpiresInSeconds !== undefined) {
        options.expiresIn = this.jwtExpiresInSeconds;
    }
    return jwt.sign(payloadWithJti, this.jwtSecret, options);
  }

  /**
   * Generates a JWT refresh token.
   * @param payload - The payload to include in the token (usually minimal, like userId).
   * @returns The generated JWT refresh token.
   */
  generateRefreshToken(payload: { userId: string }): string {
    // Add a unique identifier (jti) to the payload for blacklisting purposes
    const payloadWithJti = { ...payload, jti: this.generateJti() };
    // Explicitly provide SignOptions with expiresIn in seconds
    const options: jwt.SignOptions = {};
     if (this.jwtRefreshExpiresInSeconds !== undefined) {
        options.expiresIn = this.jwtRefreshExpiresInSeconds;
    }
    return jwt.sign(payloadWithJti, this.jwtSecret, options);
  }

  /**
   * Verifies a JWT token.
   * @param token - The JWT token to verify.
   * @returns The decoded payload if verification is successful and token is not blacklisted, otherwise throws an error.
   */
  verifyToken(token: string): JwtPayload & { jti: string } {
    try {
      // Cast the result to the expected type
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload & { jti: string };

      // Check if the token's JTI is blacklisted
      if (decoded.jti && blacklistedTokens.has(decoded.jti)) {
        throw new Error('Token has been revoked');
      }

      return decoded;
    } catch (error: any) {
      console.error('JWT Verification Error:', error.message);
      // Re-throw specific errors or a generic one
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      } else {
        throw new Error(error.message || 'Token verification failed');
      }
    }
  }

  /**
   * Blacklists a JWT token by its JTI (JWT ID).
   * Assumes the token payload contains a 'jti' claim.
   * @param jti - The JTI of the token to blacklist.
   */
  blacklistToken(jti: string): void {
    if (jti) {
      blacklistedTokens.add(jti);
      console.log(`Token with JTI ${jti} blacklisted.`);
      // Optional: Add logic to clean up expired JTIs from the blacklist periodically
    }
  }

  /**
   * Generates a unique identifier for JWT (JTI - JWT ID).
   * Simple implementation using timestamp and random number.
   * @returns A unique string identifier.
   */
  private generateJti(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  // TODO: Implement JWT signing/encryption options if needed beyond basic secret signing
}

