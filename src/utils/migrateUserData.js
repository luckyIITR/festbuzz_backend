const mongoose = require('mongoose');
const FestRegistration = require('../models/FestRegistration');
const User = require('../models/User');

// Migration script to move personal information from FestRegistration to User model
async function migrateUserData() {
  try {
    console.log('Starting migration of user data...');
    
    // Get all unique users who have fest registrations
    const registrations = await FestRegistration.find({}).populate('userId');
    
    for (const registration of registrations) {
      const user = registration.userId;
      
      // Update user with personal information from registration
      const updateData = {};
      
      if (registration.phone && !user.phone) {
        updateData.phone = registration.phone;
      }
      
      if (registration.dateOfBirth && !user.dateOfBirth) {
        updateData.dateOfBirth = registration.dateOfBirth;
      }
      
      if (registration.gender && !user.gender) {
        updateData.gender = registration.gender;
      }
      
      if (registration.city && !user.city) {
        updateData.city = registration.city;
      }
      
      if (registration.state && !user.state) {
        updateData.state = registration.state;
      }
      
      if (registration.instituteName && !user.instituteName) {
        updateData.instituteName = registration.instituteName;
      }
      
      // Update user if there's data to update
      if (Object.keys(updateData).length > 0) {
        await User.findByIdAndUpdate(user._id, updateData);
        console.log(`Updated user ${user.email} with personal information`);
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Function to clean up FestRegistration documents (remove personal info)
async function cleanupFestRegistrations() {
  try {
    console.log('Cleaning up FestRegistration documents...');
    
    // Remove personal information fields from all registrations
    await FestRegistration.updateMany({}, {
      $unset: {
        phone: 1,
        dateOfBirth: 1,
        gender: 1,
        city: 1,
        state: 1,
        instituteName: 1
      }
    });
    
    console.log('FestRegistration cleanup completed!');
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      console.log('Connected to MongoDB');
      
      // Run migration
      await migrateUserData();
      
      // Run cleanup
      await cleanupFestRegistrations();
      
      console.log('All operations completed!');
      process.exit(0);
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB:', err);
      process.exit(1);
    });
}

module.exports = {
  migrateUserData,
  cleanupFestRegistrations
}; 