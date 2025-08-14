/**
 * Standardized API Response Utility
 * Provides consistent response structure across all endpoints
 */

/**
 * Success Response Helper
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {string} message - Success message
 * @param {*} data - Response data
 * @param {Object} meta - Optional metadata (pagination, etc.)
 */
const successResponse = (res, statusCode = 200, message, data = null, meta = null) => {
  const response = {
    success: true,
    message: message || 'Operation completed successfully'
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Error Response Helper
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {string} message - Error message
 * @param {Array} errors - Array of field-specific errors
 * @param {string} code - Error code for categorization
 */
const errorResponse = (res, statusCode = 400, message, errors = null, code = null) => {
  const response = {
    success: false,
    message: message || 'An error occurred'
  };

  if (errors !== null) {
    response.errors = errors;
  }

  if (code !== null) {
    response.code = code;
  }

  return res.status(statusCode).json(response);
};

/**
 * Pagination Helper
 * @param {Array} data - Array of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @returns {Object} Meta object with pagination info
 */
const createPaginationMeta = (page, limit, total) => {
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total: parseInt(total),
    pages: Math.ceil(total / parseInt(limit))
  };
};

/**
 * Validation Error Helper
 * @param {Array} validationErrors - Array of validation errors
 * @returns {Array} Formatted errors array
 */
const formatValidationErrors = (validationErrors) => {
  if (Array.isArray(validationErrors)) {
    return validationErrors;
  }

  // Handle mongoose validation errors
  if (validationErrors && typeof validationErrors === 'object') {
    return Object.keys(validationErrors).map(field => ({
      field,
      message: validationErrors[field]
    }));
  }

  return [];
};

module.exports = {
  successResponse,
  errorResponse,
  createPaginationMeta,
  formatValidationErrors
};
