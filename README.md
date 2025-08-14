# Festbuz Backend API

A comprehensive Node.js backend API for festival and event management system built with Express.js and MongoDB.

## 🚀 Features

- **User Authentication**: JWT-based authentication with OTP verification
- **Google OAuth**: Social login integration
- **Festival Management**: CRUD operations for festivals
- **Event Management**: Comprehensive event handling
- **Registration System**: Event and festival registration
- **Wishlist & Recently Viewed**: User preferences tracking
- **Role-based Access Control**: Admin, organizer, and user roles
- **File Upload**: Image upload support
- **Email Notifications**: Automated email sending
- **API Documentation**: Swagger/OpenAPI documentation
- **Rate Limiting**: Security and performance optimization
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Centralized error management with standardized response structure
- **Logging**: Structured logging with Winston
- **Testing**: Jest-based test suite
- **Standardized API Responses**: Consistent response format across all endpoints

## 📋 Prerequisites

- Node.js (>= 18.0.0)
- npm (>= 8.0.0)
- MongoDB (>= 5.0)
- SMTP server for email functionality

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd festbuz_backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/festbuz
   JWT_SECRET=your-super-secret-jwt-key
   GOOGLE_CLIENT_ID=your-google-client-id
   EMAIL_HOST=smtp.gmail.com
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-email-password
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
festbuz_backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js   # Database connection
│   │   └── swagger.js    # API documentation
│   ├── controllers/      # Business logic
│   │   └── authController.js
│   ├── middlewares/      # Express middlewares
│   │   ├── auth.js       # Authentication middleware
│   │   ├── errorHandler.js # Error handling
│   │   ├── security.js   # Security middleware
│   │   ├── validation.js # Input validation
│   │   └── rolePermissions.js
│   ├── models/           # MongoDB models
│   │   ├── User.js
│   │   ├── Fest.js
│   │   ├── Event.js
│   │   └── ...
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── fest.js
│   │   ├── event.js
│   │   └── ...
│   ├── services/         # Business services
│   │   ├── wishlistService.js
│   │   └── recentlyViewedService.js
│   ├── utils/            # Utility functions
│   │   ├── logger.js     # Winston logger
│   │   ├── email.js      # Email utilities
│   │   └── response.js   # Standardized response utilities
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── tests/               # Test files
│   ├── setup.js
│   └── auth.test.js
├── logs/                # Application logs
├── uploads/             # File uploads
├── .env.example         # Environment variables template
├── .eslintrc.js         # ESLint configuration
├── .prettierrc          # Prettier configuration
├── jest.config.js       # Jest configuration
└── package.json
```

## 🚀 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run docs` - Generate API documentation

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/forgot-password` - Request password reset

### Festivals
- `GET /api/fests` - Get all festivals
- `POST /api/fests` - Create new festival
- `GET /api/fests/:id` - Get festival by ID
- `PUT /api/fests/:id` - Update festival
- `DELETE /api/fests/:id` - Delete festival

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Registration
- `POST /api/registration/event` - Register for event
- `POST /api/registration/fest` - Register for festival
- `GET /api/registration/my-registrations` - Get user registrations

### User Features
- `GET /api/myfests` - Get user's festivals
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:id` - Remove from wishlist
- `GET /api/recently-viewed` - Get recently viewed items

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Cross-origin resource sharing configuration
- **Security Headers**: Helmet.js for security headers
- **Password Hashing**: bcrypt for secure password storage
- **OTP Verification**: Email-based account verification

## 📊 API Documentation

When running in development mode, API documentation is available at:
```
http://localhost:5000/api-docs
```

## 📋 API Response Standards

The API follows a standardized response structure for consistency and better developer experience. All responses include:

### Success Response
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

### Error Response
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

For detailed information about response standards, error codes, and best practices, see [API Response Standards Documentation](docs/API_RESPONSE_STANDARDS.md).

## 🧪 Testing

The project includes a comprehensive test suite using Jest and Supertest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📝 Code Quality

The project uses ESLint and Prettier for code quality:

```bash
# Check code quality
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 🚀 Deployment

### Environment Variables for Production

Make sure to set the following environment variables in production:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
EMAIL_HOST=your-smtp-host
EMAIL_USER=your-email-user
EMAIL_PASS=your-email-password
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@festbuz.com or create an issue in the repository.

## 🔄 Changelog

### Version 1.0.0
- Initial release with complete festival and event management system
- User authentication with JWT and OTP verification
- Google OAuth integration
- Role-based access control
- Comprehensive API documentation
- Security features and rate limiting
- Testing suite with Jest
- Code quality tools (ESLint, Prettier) 