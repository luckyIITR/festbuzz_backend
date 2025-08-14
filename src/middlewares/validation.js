const { validationResult, body, query } = require('express-validator');
const { AppError } = require('./errorHandler');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new AppError(errorMessages.join(', '), 400));
  }
  next();
};

// Common validation rules
const commonValidations = {
  // User validations
  signup: [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
    body('role').optional().isIn(['user', 'admin', 'organizer']).withMessage('Invalid role'),
    validate
  ],

  login: [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],

  // Fest validations
  createFest: [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Fest name must be between 2 and 100 characters'),
    body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
    body('startDate').isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').isISO8601().withMessage('End date must be a valid date'),
    body('venue').trim().notEmpty().withMessage('Venue is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    validate
  ],

  updateFest: [
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Fest name must be between 2 and 100 characters'),
    body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
    body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
    body('venue').optional().trim().notEmpty().withMessage('Venue is required'),
    validate
  ],

  // Event validations
  createEvent: [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Event name must be between 2 and 100 characters'),
    body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
    body('startTime').isISO8601().withMessage('Start time must be a valid date'),
    body('endTime').isISO8601().withMessage('End time must be a valid date'),
    body('venue').trim().notEmpty().withMessage('Venue is required'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    validate
  ],

  // Registration validations
  registerEvent: [
    body('eventId').isMongoId().withMessage('Invalid event ID'),
    body('paymentMethod').optional().isIn(['card', 'upi', 'cash']).withMessage('Invalid payment method'),
    validate
  ],

  // Pagination validations
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('sort').optional().isString().withMessage('Sort must be a string'),
    validate
  ],

  // Search validations
  search: [
    query('q').optional().trim().isLength({ min: 1 }).withMessage('Search query cannot be empty'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('location').optional().isString().withMessage('Location must be a string'),
    validate
  ]
};

// MongoDB ObjectId validation
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new AppError('Invalid ID format', 400));
  }
  next();
};

module.exports = {
  validate,
  commonValidations,
  validateObjectId
};
