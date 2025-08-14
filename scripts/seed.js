require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const logger = require('../src/utils/logger');

// Import models
const User = require('../src/models/User');
const Fest = require('../src/models/Fest');
const Event = require('../src/models/Event');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Connected to database for seeding');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  const users = [
    {
      name: 'Admin User',
      email: 'admin@festbuz.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
      isVerified: true,
      phone: '1234567890',
      college: 'Admin College'
    },
    {
      name: 'Organizer User',
      email: 'organizer@festbuz.com',
      password: await bcrypt.hash('organizer123', 10),
      role: 'organizer',
      isVerified: true,
      phone: '1234567891',
      college: 'Organizer College'
    },
    {
      name: 'Regular User',
      email: 'user@festbuz.com',
      password: await bcrypt.hash('user123', 10),
      role: 'user',
      isVerified: true,
      phone: '1234567892',
      college: 'User College'
    }
  ];

  for (const userData of users) {
    const existingUser = await User.findOne({ email: userData.email });
    if (!existingUser) {
      await User.create(userData);
      logger.info(`Created user: ${userData.email}`);
    }
  }
};

const seedFests = async () => {
  const fests = [
    {
      name: 'TechFest 2024',
      description: 'Annual technology festival showcasing the latest innovations',
      startDate: new Date('2024-03-15'),
      endDate: new Date('2024-03-17'),
      venue: 'Main Campus Auditorium',
      category: 'Technology',
      organizer: 'Tech Club',
      image: 'https://example.com/techfest.jpg',
      status: 'upcoming',
      registrationDeadline: new Date('2024-03-10'),
      maxParticipants: 500,
      entryFee: 100
    },
    {
      name: 'Cultural Fest 2024',
      description: 'Celebration of diverse cultures through music, dance, and art',
      startDate: new Date('2024-04-20'),
      endDate: new Date('2024-04-22'),
      venue: 'Open Air Theater',
      category: 'Cultural',
      organizer: 'Cultural Committee',
      image: 'https://example.com/culturalfest.jpg',
      status: 'upcoming',
      registrationDeadline: new Date('2024-04-15'),
      maxParticipants: 1000,
      entryFee: 50
    },
    {
      name: 'Sports Meet 2024',
      description: 'Annual sports competition with various athletic events',
      startDate: new Date('2024-05-10'),
      endDate: new Date('2024-05-12'),
      venue: 'Sports Complex',
      category: 'Sports',
      organizer: 'Sports Department',
      image: 'https://example.com/sportsmeet.jpg',
      status: 'upcoming',
      registrationDeadline: new Date('2024-05-05'),
      maxParticipants: 300,
      entryFee: 75
    }
  ];

  for (const festData of fests) {
    const existingFest = await Fest.findOne({ name: festData.name });
    if (!existingFest) {
      await Fest.create(festData);
      logger.info(`Created fest: ${festData.name}`);
    }
  }
};

const seedEvents = async () => {
  const techFest = await Fest.findOne({ name: 'TechFest 2024' });
  const culturalFest = await Fest.findOne({ name: 'Cultural Fest 2024' });

  if (techFest) {
    const techEvents = [
      {
        name: 'Hackathon',
        description: '24-hour coding competition',
        startTime: new Date('2024-03-15T09:00:00'),
        endTime: new Date('2024-03-16T09:00:00'),
        venue: 'Computer Lab',
        capacity: 50,
        price: 0,
        festId: techFest._id,
        organizer: 'Tech Club',
        category: 'Competition'
      },
      {
        name: 'Tech Talk',
        description: 'Guest lecture by industry experts',
        startTime: new Date('2024-03-16T14:00:00'),
        endTime: new Date('2024-03-16T16:00:00'),
        venue: 'Auditorium',
        capacity: 200,
        price: 0,
        festId: techFest._id,
        organizer: 'Tech Club',
        category: 'Workshop'
      }
    ];

    for (const eventData of techEvents) {
      const existingEvent = await Event.findOne({ name: eventData.name, festId: techFest._id });
      if (!existingEvent) {
        await Event.create(eventData);
        logger.info(`Created event: ${eventData.name}`);
      }
    }
  }

  if (culturalFest) {
    const culturalEvents = [
      {
        name: 'Dance Competition',
        description: 'Inter-college dance competition',
        startTime: new Date('2024-04-20T18:00:00'),
        endTime: new Date('2024-04-20T22:00:00'),
        venue: 'Open Air Theater',
        capacity: 100,
        price: 25,
        festId: culturalFest._id,
        organizer: 'Cultural Committee',
        category: 'Competition'
      },
      {
        name: 'Music Concert',
        description: 'Live music performance by college bands',
        startTime: new Date('2024-04-21T19:00:00'),
        endTime: new Date('2024-04-21T23:00:00'),
        venue: 'Open Air Theater',
        capacity: 500,
        price: 50,
        festId: culturalFest._id,
        organizer: 'Cultural Committee',
        category: 'Performance'
      }
    ];

    for (const eventData of culturalEvents) {
      const existingEvent = await Event.findOne({ name: eventData.name, festId: culturalFest._id });
      if (!existingEvent) {
        await Event.create(eventData);
        logger.info(`Created event: ${eventData.name}`);
      }
    }
  }
};

const runSeeding = async () => {
  try {
    logger.info('Starting database seeding...');

    await seedUsers();
    await seedFests();
    await seedEvents();

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
};

const main = async () => {
  await connectDB();
  await runSeeding();
  await mongoose.connection.close();
  logger.info('Seeding process completed');
  process.exit(0);
};

main().catch((error) => {
  logger.error('Seeding script failed:', error);
  process.exit(1);
});
