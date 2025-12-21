
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';


import authRoutes from './routes/auth.js';
import cors from 'cors';
import axios from 'axios';
import gptRoute from './routes/gpt.js';
import listRoutes from './routes/list.js';
import watchlistRoutes from './routes/watchlist.js';
import reviewRoutes from './routes/review.js';
import peopleRoutes from './routes/people.js';
import streamingRoutes from './routes/streaming.js';
import boxOfficeRoutes from './routes/boxoffice.js';
import picksRoutes from './routes/picks.js';
import notificationRoutes from './routes/notifications.js';
import exportRoutes from './routes/export.js';
import adminRoutes from './routes/admin.js';
import connectDB from './db.js';
import userRoutes from './routes/user.js';

dotenv.config();

// Check for required environment variables
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not set in .env');
  process.exit(1);
}


const app = express();

// Connect to MongoDB and start server

// Add your Vercel URL to the list of allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://cineshelf-project-mjde.vercel.app' // <<-- यह सही URL है
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
})); // Allow both common frontend ports and allow credentials
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/list', listRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/people', peopleRoutes);
app.use('/api/streaming', streamingRoutes);
app.use('/api/boxoffice', boxOfficeRoutes);
app.use('/api/picks', picksRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/admin', adminRoutes);
// Rate limiting for AI endpoint
const gptLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per minute
  message: 'Too many requests, please try again later.'
});
app.use('/api/gpt', gptLimiter);
app.use('/api', gptRoute);

// Proxy routes for TMDB API
app.get('/api/tmdb/popular', async (req, res) => {
  try {
    const tmdbRes = await axios.get('https://api.themoviedb.org/3/movie/popular', {
      params: { api_key: process.env.VITE_TMDB_KEY },
      timeout: 20000
    });
    res.json(tmdbRes.data);
  } catch (err) {
    console.error('TMDB proxy error:', err.message);
    if (err.response) {
      res.status(err.response.status).json({ error: err.response.data });
    } else if (err.code === 'ECONNABORTED') {
      res.status(504).json({ error: 'TMDB request timed out' });
    } else {
      res.status(500).json({ error: 'Failed to fetch from TMDB', details: err.message });
    }
  }
});

// TMDB movie details proxy
app.get('/api/tmdb/movie/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tmdbRes = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
      params: { 
        api_key: process.env.VITE_TMDB_KEY,
        append_to_response: 'credits,videos,similar'
      },
      timeout: 20000
    });
    res.json(tmdbRes.data);
  } catch (err) {
    console.error('TMDB movie details error:', err.message);
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});

// TMDB TV show details proxy
app.get('/api/tmdb/tv/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tmdbRes = await axios.get(`https://api.themoviedb.org/3/tv/${id}`, {
      params: { 
        api_key: process.env.VITE_TMDB_KEY,
        append_to_response: 'credits,videos,similar'
      },
      timeout: 20000
    });
    res.json(tmdbRes.data);
  } catch (err) {
    console.error('TMDB TV details error:', err.message);
    res.status(500).json({ error: 'Failed to fetch TV show details' });
  }
});

// TMDB person details proxy
app.get('/api/tmdb/person/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tmdbRes = await axios.get(`https://api.themoviedb.org/3/person/${id}`, {
      params: { 
        api_key: process.env.VITE_TMDB_KEY,
        append_to_response: 'movie_credits,tv_credits'
      },
      timeout: 20000
    });
    res.json(tmdbRes.data);
  } catch (err) {
    console.error('TMDB person details error:', err.message);
    res.status(500).json({ error: 'Failed to fetch person details' });
  }
});

// TMDB search proxy
app.get('/api/tmdb/search', async (req, res) => {
  try {
    const { query, type = 'movie', page = 1 } = req.query;
    const tmdbRes = await axios.get(`https://api.themoviedb.org/3/search/${type}`, {
      params: { 
        api_key: process.env.VITE_TMDB_KEY,
        query,
        page
      },
      timeout: 20000
    });
    res.json(tmdbRes.data);
  } catch (err) {
    console.error('TMDB search error:', err.message);
    res.status(500).json({ error: 'Failed to search TMDB' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => res.send('OK'));

// Example root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Handle 404 for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err);
    process.exit(1);
  });
