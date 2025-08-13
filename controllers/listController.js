import List from '../models/List.js';
import Review from '../models/Review.js';

export const getList = async (req, res) => {
  try {
    const list = await List.findOne({ user: req.user.id });
    res.json(list || { movies: [] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const addToList = async (req, res) => {
  try {
    console.log('Adding to list:', req.body);
    
    let list = await List.findOne({ user: req.user.id });
    if (!list) {
      list = new List({ user: req.user.id, movies: [] });
    }
    
    // Check if movie already exists
    const existingMovie = list.movies.find(m => m.tmdbId === req.body.tmdbId);
    if (existingMovie) {
      return res.status(400).json({ error: 'Movie already in list' });
    }
    
    // Normalize movie/TV show data to match schema
    const movieData = {
      tmdbId: req.body.tmdbId || req.body.id,
      title: req.body.title || req.body.name, // Handle both movie.title and TV show.name
      poster: req.body.poster || req.body.posterUrl || req.body.poster_path,
      posterUrl: req.body.posterUrl || req.body.poster_path || req.body.poster,
      overview: req.body.overview,
      releaseDate: req.body.releaseDate || req.body.release_date || req.body.first_air_date, // Handle TV show first_air_date
      voteAverage: req.body.voteAverage || req.body.vote_average,
      genreIds: req.body.genreIds || req.body.genre_ids,
      rating: req.body.rating || null,
      review: req.body.review || '',
      mediaType: req.body.mediaType || 'movie', // Add media type to distinguish movies from TV shows
      watchedAt: req.body.watchedAt || new Date()
    };
    
    console.log('Normalized movie data:', movieData);
    list.movies.push(movieData);
    await list.save();
    
    // If rating is provided, also create a review
    if (req.body.rating && req.body.rating > 0) {
      try {
        const existingReview = await Review.findOne({ 
          user: req.user.id, 
          tmdbId: movieData.tmdbId 
        });
        
        if (!existingReview) {
          const review = new Review({
            user: req.user.id,
            tmdbId: movieData.tmdbId,
            title: movieData.title,
            poster: movieData.poster,
            rating: movieData.rating,
            review: movieData.review || ''
          });
          await review.save();
        }
      } catch (reviewErr) {
        console.error('Review creation error:', reviewErr);
        // Don't fail the list addition if review creation fails
      }
    }
    
    res.json(list);
  } catch (err) {
    console.error('List add error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const removeFromList = async (req, res) => {
  try {
    const list = await List.findOne({ user: req.user.id });
    if (!list) return res.status(404).json({ error: 'List not found' });
    list.movies = list.movies.filter(m => m.tmdbId != req.params.tmdbId);
    await list.save();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
