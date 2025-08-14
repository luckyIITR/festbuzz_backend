# API Response Standards

This document outlines the standardized response structure used throughout the Festbuz API to ensure consistency and better developer experience.

## Overview

All API endpoints follow a consistent response structure with two main types:
1. **Success Responses** - For successful operations
2. **Error Responses** - For failed operations

## 1. Success Response Structure

### Standard Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "meta": {
    // Optional metadata (pagination, etc.)
  }
}
```

### Examples

#### Simple Success Response
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Success Response with Pagination
```json
{
  "success": true,
  "message": "Festivals retrieved successfully",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Tech Fest 2024",
      "description": "Annual technology festival",
      "startDate": "2024-03-15T00:00:00.000Z",
      "endDate": "2024-03-17T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

#### Success Response without Data
```json
{
  "success": true,
  "message": "Festival deleted successfully"
}
```

## 2. Error Response Structure

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error message"
    }
  ],
  "code": "ERROR_CODE"
}
```

### Examples

#### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ],
  "code": "VALIDATION_ERROR"
}
```

#### Resource Not Found Error
```json
{
  "success": false,
  "message": "Festival not found",
  "code": "FEST_NOT_FOUND"
}
```

#### Authentication Error
```json
{
  "success": false,
  "message": "Invalid token. Please log in again.",
  "code": "INVALID_TOKEN"
}
```

#### Duplicate Field Error
```json
{
  "success": false,
  "message": "Duplicate field value: email. Please use another value.",
  "errors": [
    {
      "field": "email",
      "message": "This email is already taken"
    }
  ],
  "code": "DUPLICATE_FIELD"
}
```

## 3. Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Input validation failed | 400 |
| `DUPLICATE_FIELD` | Duplicate field value | 400 |
| `USER_EXISTS` | User already exists | 400 |
| `ALREADY_VERIFIED` | User already verified | 400 |
| `INVALID_OTP` | Invalid or expired OTP | 400 |
| `ALREADY_IN_WISHLIST` | Item already in wishlist | 400 |
| `FILE_TOO_LARGE` | File size exceeds limit | 400 |
| `UNEXPECTED_FILE` | Unexpected file field | 400 |
| `INVALID_CREDENTIALS` | Invalid login credentials | 401 |
| `EMAIL_NOT_VERIFIED` | Email not verified | 401 |
| `INVALID_TOKEN` | Invalid JWT token | 401 |
| `TOKEN_EXPIRED` | JWT token expired | 401 |
| `USER_NOT_FOUND` | User not found | 404 |
| `FEST_NOT_FOUND` | Festival not found | 404 |
| `EVENT_NOT_FOUND` | Event not found | 404 |
| `WISHLIST_ITEM_NOT_FOUND` | Wishlist item not found | 404 |
| `RECENTLY_VIEWED_ITEM_NOT_FOUND` | Recently viewed item not found | 404 |
| `RESOURCE_NOT_FOUND` | Generic resource not found | 404 |
| `ROUTE_NOT_FOUND` | API route not found | 404 |
| `INTERNAL_SERVER_ERROR` | Internal server error | 500 |

## 4. Pagination Meta Structure

When endpoints return paginated data, the `meta` object contains:

```json
{
  "page": 1,        // Current page number
  "limit": 10,      // Items per page
  "total": 45,      // Total number of items
  "pages": 5        // Total number of pages
}
```

## 5. Implementation Details

### Response Utility Functions

The API uses utility functions from `src/utils/response.js`:

- `successResponse(res, statusCode, message, data, meta)` - For success responses
- `errorResponse(res, statusCode, message, errors, code)` - For error responses
- `createPaginationMeta(page, limit, total)` - For pagination metadata
- `formatValidationErrors(validationErrors)` - For formatting validation errors

### Usage in Controllers

```javascript
// Success response
return successResponse(res, 200, 'Data retrieved successfully', data);

// Success response with pagination
return successResponse(
  res, 
  200, 
  'Data retrieved successfully', 
  data, 
  createPaginationMeta(page, limit, total)
);

// Error response
return next(new AppError('Error message', 400, 'ERROR_CODE', errors));
```

## 6. Best Practices

1. **Always use the standardized response structure** - Don't create custom response formats
2. **Provide meaningful messages** - Use clear, user-friendly error messages
3. **Include appropriate error codes** - Use specific error codes for better error handling
4. **Use field-specific errors** - For validation errors, specify which fields failed
5. **Include pagination metadata** - For list endpoints, always include pagination info
6. **Be consistent with HTTP status codes** - Use appropriate status codes for different scenarios

## 7. Migration Notes

If you're updating existing endpoints:

1. Import the response utilities: `const { successResponse, errorResponse, createPaginationMeta } = require('../utils/response');`
2. Replace direct `res.json()` calls with `successResponse()` or `errorResponse()`
3. Update error handling to use the new `AppError` constructor with error codes
4. Ensure all responses follow the standardized structure

## 8. Testing

When testing API endpoints, verify that:

1. Success responses include `success: true`
2. Error responses include `success: false`
3. All responses have appropriate `message` fields
4. Error responses include relevant `code` and `errors` fields
5. Paginated responses include proper `meta` information
