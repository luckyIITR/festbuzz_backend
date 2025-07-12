require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const db = require('../config/db');
const authRoutes = require('./routes/auth');
const festRoutes = require('./routes/fest');
const eventRoutes = require('./routes/event');
const registrationRoutes = require('./routes/registration');
const certificateRoutes = require('./routes/certificate');
const morgan = require('morgan');
const { swaggerUi, specs } = require('./swagger');

app.use(cors({
  // origin: 'http://localhost:3000',
  origin: '*',
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
app.use('/api/certificates', certificateRoutes);
app.use('/uploads', express.static('uploads'));
const uploadRoutes = require('./routes/upload');
app.use('/api/upload', uploadRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
