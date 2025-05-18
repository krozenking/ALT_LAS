// src/utils/response.js
/**
 * Create a success response object
 * @param {*} data - Response data
 * @returns {Object} Success response object
 */
const createSuccessResponse = (data) => {
  return {
    success: true,
    data
  };
};

/**
 * Create an error response object
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {*} details - Error details
 * @returns {Object} Error response object
 */
const createErrorResponse = (code, message, details = null) => {
  return {
    success: false,
    error: {
      code,
      message,
      details
    }
  };
};

module.exports = {
  createSuccessResponse,
  createErrorResponse
};
