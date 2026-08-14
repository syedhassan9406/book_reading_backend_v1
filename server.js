const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Import middlewares
const {
  notFound,
  errorHandler,
} = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const communityRoutes = require('./routes/communityRoutes');

const app = express();

// ========================================
// Middleware
// ========================================

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ========================================
// Health Check
// ========================================

app.get('/api/health', async (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Book Reading App API is running',
  });
});

// ========================================
// Database
// ========================================

// Connect to MongoDB
// Do this before handling API requests.
connectDB();

// ========================================
// API Routes
// ========================================

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/community', communityRoutes);

// ========================================
// 404 Handler
// ========================================

app.use(notFound);

// ========================================
// Error Handler
// ========================================

app.use(errorHandler);

// ========================================
// Vercel Export
// ========================================

// IMPORTANT:
// Do NOT use app.listen() on Vercel.
module.exports = app;
