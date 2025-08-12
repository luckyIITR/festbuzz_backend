require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const db = require('../config/db');
const authRoutes = require('./routes/auth');
const festRoutes = require('./routes/fest');
const eventRoutes = require('./routes/event');
const registrationRoutes = require('./routes/registration');
const morgan = require('morgan');
const myfestsRoutes = require('./routes/myfests');
const wishlistRoutes = require('./routes/wishlist');
const recentlyViewedRoutes = require('./routes/recentlyViewed');

app.use(cors({
  origin: ['http://localhost:3000', 'https://festbuzz-frontend.vercel.app'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Festbuz Backend API Running');
});

app.use('/api/auth', authRoutes);
app.use('/api/fests', festRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/myfests', myfestsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/recently-viewed', recentlyViewedRoutes);
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
