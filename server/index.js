const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();

// Trust the nginx reverse proxy so req.ip reflects the real client IP
// (needed for correct per-client rate limiting).
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/destinations', require('./routes/destinations'));
app.use('/api/hotels', require('./routes/hotels'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/packages', require('./routes/packages'));
app.use('/api/treks', require('./routes/treks'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/rentals', require('./routes/rentals'));
app.use('/api/enquiries', require('./routes/enquiries'));
app.use('/api/homestays', require('./routes/homestays'));
app.use('/api/houseboats', require('./routes/houseboats'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/books', require('./routes/books'));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/settings', require('./routes/settings'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Kashmir Booking API is running' });
});

// Serve client build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
