require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../src/utils/logger');

// Import models
const User = require('../src/models/User');
const Fest = require('../src/models/Fest');
const Event = require('../src/models/Event');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Connected to database for migration');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

const runMigrations = async () => {
  try {
    logger.info('Starting database migrations...');

    // Migration 1: Add indexes for better performance
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ googleId: 1 });
    await Fest.collection.createIndex({ organizer: 1 });
    await Fest.collection.createIndex({ startDate: 1 });
    await Event.collection.createIndex({ festId: 1 });
    await Event.collection.createIndex({ startTime: 1 });

    logger.info('Migration completed successfully');

    // Migration 2: Update existing documents if needed
    // Example: Update user roles to have default value
    const result = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'user' } }
    );
    
    if (result.modifiedCount > 0) {
      logger.info(`Updated ${result.modifiedCount} users with default role`);
    }

    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
};

const main = async () => {
  await connectDB();
  await runMigrations();
  await mongoose.connection.close();
  logger.info('Migration process completed');
  process.exit(0);
};

main().catch((error) => {
  logger.error('Migration script failed:', error);
  process.exit(1);
});
