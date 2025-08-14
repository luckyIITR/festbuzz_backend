require('dotenv').config();
const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

// Import configurations and middleware
const connectDB = require('./config/database');
const { setupSecurity } = require('./middlewares/security');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const festRoutes = require('./routes/fest');
const eventRoutes = require('./routes/event');
const registrationRoutes = require('./routes/registration');
const myfestsRoutes = require('./routes/myfests');
const wishlistRoutes = require('./routes/wishlist');
const recentlyViewedRoutes = require('./routes/recentlyViewed');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Security middleware
setupSecurity(app);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/fests', festRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/myfests', myfestsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/recently-viewed', recentlyViewedRoutes);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Documentation
if (process.env.NODE_ENV !== 'production') {
  const swaggerUi = require('swagger-ui-express');
  const specs = require('./config/swagger');
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Festbuz API Documentation'
  }));
}

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
  });
});

module.exports = app;
