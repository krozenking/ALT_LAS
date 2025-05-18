// src/utils/error.js
/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  /**
   * Create a new API error
   * @param {string} code - Error code
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {*} details - Error details
   */
  constructor(code, message, statusCode = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = {
  ApiError
};
