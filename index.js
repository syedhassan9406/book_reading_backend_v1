const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Import middlewares
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const communityRoutes = require('./routes/communityRoutes');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Book Reading App API is running' });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/community', communityRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
