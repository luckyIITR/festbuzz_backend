const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    // const options = {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    //   maxPoolSize: 10,
    //   serverSelectionTimeoutMS: 5000,
    //   socketTimeoutMS: 45000,
    //   bufferMaxEntries: 0,
    //   bufferCommands: false,
    // };

    await mongoose.connect(mongoURI);
    
    logger.info('MongoDB connected successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (err) {
    logger.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
