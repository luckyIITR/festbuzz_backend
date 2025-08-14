const logger = require('../utils/logger');
const { errorResponse, formatValidationErrors } = require('../utils/response');

// Custom error class
class AppError extends Error {
  constructor(message, statusCode, code = null, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404, 'RESOURCE_NOT_FOUND');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}. Please use another value.`;
    const errors = [{ field, message: `This ${field} is already taken` }];
    error = new AppError(message, 400, 'DUPLICATE_FIELD', errors);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = formatValidationErrors(err.errors);
    const message = 'Validation failed';
    error = new AppError(message, 400, 'VALIDATION_ERROR', errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = new AppError(message, 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired. Please log in again.';
    error = new AppError(message, 401, 'TOKEN_EXPIRED');
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large. Maximum size is 5MB.';
    error = new AppError(message, 400, 'FILE_TOO_LARGE');
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field.';
    error = new AppError(message, 400, 'UNEXPECTED_FILE');
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const code = error.code || 'INTERNAL_SERVER_ERROR';
  const errors = error.errors || null;

  return errorResponse(res, statusCode, message, errors, code);
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
  next(error);
};

module.exports = {
  AppError,
  errorHandler,
  notFound
};
