import Review from '../models/Review.js';
import List from '../models/List.js';

export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const addReview = async (req, res) => {
  try {
    const review = new Review({ ...req.body, user: req.user.id });
    await review.save();
    
    // Also add to user's list if not already there
    let list = await List.findOne({ user: req.user.id });
    if (!list) {
      list = new List({ user: req.user.id, movies: [] });
    }
    
    // Check if movie already exists in list
    const existingMovie = list.movies.find(m => m.tmdbId === req.body.tmdbId);
    if (!existingMovie) {
      // Add movie/TV show to list with review data
      const movieData = {
        tmdbId: req.body.tmdbId,
        title: req.body.title || req.body.name, // Handle both movie.title and TV show.name
        poster: req.body.poster || req.body.posterUrl || req.body.poster_path,
        posterUrl: req.body.posterUrl || req.body.poster || req.body.poster_path,
        overview: req.body.overview,
        releaseDate: req.body.releaseDate || req.body.first_air_date, // Handle TV show first_air_date
        voteAverage: req.body.voteAverage,
        genreIds: req.body.genreIds,
        rating: req.body.rating,
        review: req.body.review,
        mediaType: req.body.mediaType || 'movie', // Add media type to distinguish movies from TV shows
        watchedAt: new Date()
      };
      list.movies.push(movieData);
      await list.save();
    } else {
      // Update existing movie with review data
      existingMovie.rating = req.body.rating;
      existingMovie.review = req.body.review;
      await list.save();
    }
    
    res.json(review);
  } catch (err) {
    console.error('Review add error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateReview = async (req, res) => {
  try {
    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
