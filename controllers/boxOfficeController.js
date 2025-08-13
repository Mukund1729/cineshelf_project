import axios from 'axios';

// Get box office data by year
export const getBoxOfficeByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const { page = 1 } = req.query;
    const apiKey = process.env.VITE_TMDB_KEY;
    
    const response = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
      params: {
        api_key: apiKey,
        sort_by: 'revenue.desc',
        primary_release_year: year,
        page
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Box office by year error:', error);
    res.status(500).json({ error: 'Failed to fetch box office data by year' });
  }
};

// Get box office data by person
export const getBoxOfficeByPerson = async (req, res) => {
  try {
    const { personId } = req.params;
    const { page = 1 } = req.query;
    const apiKey = process.env.VITE_TMDB_KEY;
    
    // First get person details
    const personResponse = await axios.get(`https://api.themoviedb.org/3/person/${personId}`, {
      params: { api_key: apiKey }
    });
    
    // Then get their movie credits
    const creditsResponse = await axios.get(`https://api.themoviedb.org/3/person/${personId}/movie_credits`, {
      params: { api_key: apiKey }
    });
    
    // Filter movies with revenue data and sort by revenue
    const moviesWithRevenue = creditsResponse.data.cast
      .filter(movie => movie.revenue && movie.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue);
    
    res.json({
      person: personResponse.data,
      movies: moviesWithRevenue,
      total_revenue: moviesWithRevenue.reduce((sum, movie) => sum + movie.revenue, 0)
    });
  } catch (error) {
    console.error('Box office by person error:', error);
    res.status(500).json({ error: 'Failed to fetch box office data by person' });
  }
};

// Get India box office data
export const getBoxOfficeIndia = async (req, res) => {
  try {
    const { year, language, page = 1 } = req.query;
    const apiKey = process.env.VITE_TMDB_KEY;
    
    let params = {
      api_key: apiKey,
      sort_by: 'revenue.desc',
      page,
      with_origin_country: 'IN'
    };
    
    if (year) {
      params.primary_release_year = year;
    }
    
    if (language && language !== 'all') {
      params.with_original_language = language;
    }
    
    const response = await axios.get(`https://api.themoviedb.org/3/discover/movie`, { params });
    
    // Filter for Indian movies and add revenue formatting
    const indianMovies = response.data.results
      .filter(movie => movie.revenue && movie.revenue > 0)
      .map(movie => ({
        ...movie,
        revenue_inr: movie.revenue * 83, // Approximate USD to INR conversion
        revenue_formatted: {
          usd: `$${movie.revenue.toLocaleString('en-US')}`,
          inr: `₹${(movie.revenue * 83).toLocaleString('en-IN')}`
        }
      }));
    
    res.json({
      ...response.data,
      results: indianMovies
    });
  } catch (error) {
    console.error('India box office error:', error);
    res.status(500).json({ error: 'Failed to fetch India box office data' });
  }
}; 