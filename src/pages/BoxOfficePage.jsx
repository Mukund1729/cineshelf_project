import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const START_YEAR = 1980;
const END_YEAR = new Date().getFullYear();

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function BoxOfficePage() {
  const [year, setYear] = useState(END_YEAR);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      setError(null);
      setMovies([]);
      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=revenue.desc&primary_release_year=${year}&page=1`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch movies');
        const data = await res.json();
        setMovies(data.results || []);
      } catch (err) {
        setError('Could not load box office data.');
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, [year]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#181c24] to-[#1a1333] text-white font-lato relative overflow-x-hidden">
      {/* Hero Section */}
      <div className="pt-24 pb-8 flex flex-col items-center justify-center">
        <h1 className="text-3xl md:text-4xl font-bold font-playfair text-cyan-300 mb-2 text-center">Box Office by Year</h1>
        <p className="text-gray-300 text-center mb-4 max-w-xl">Explore the highest-grossing movies for each year. Filter by year and see which films ruled the box office!</p>
        {/* Year Selector */}
        <div className="w-full flex justify-center mb-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent px-2 py-1 rounded-lg bg-[#181c24]/60">
            {range(START_YEAR, END_YEAR).map(y => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`px-3 py-1 rounded-full font-semibold text-sm transition-all ${year === y ? 'bg-cyan-400 text-black shadow' : 'bg-[#232526] text-cyan-200 hover:bg-cyan-700 hover:text-white'}`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Movies List */}
      <div className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-cyan-400 border-opacity-60"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-12">{error}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.length === 0 && (
              <div className="col-span-full text-center text-gray-400 py-8">No movies found for {year}.</div>
            )}
            {movies.map(movie => (
              <div key={movie.id} className="bg-[#181c24] rounded-xl shadow-lg overflow-hidden flex flex-col group hover:scale-105 hover:shadow-cyan-400 transition-transform duration-200 relative">
                <Link to={`/movie/${movie.id}`} className="block">
                  <img
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : 'https://placehold.co/300x450?text=No+Image'}
                    alt={movie.title}
                    className="w-full h-60 object-cover rounded-t-xl group-hover:opacity-90 transition"
                  />
                </Link>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <h3 className="text-white font-bold text-base mb-1 truncate" title={movie.title}>{movie.title}</h3>
                  <div className="flex items-center justify-between text-xs text-gray-300 mb-1">
                    <span>{movie.release_date ? movie.release_date.slice(0, 4) : 'N/A'}</span>
                    <span className="text-yellow-300 font-bold">⭐ {movie.vote_average?.toFixed(1) ?? 'N/A'}</span>
                  </div>
                  <div className="text-green-300 font-semibold text-sm">{movie.revenue ? `$${movie.revenue.toLocaleString()}` : 'Revenue N/A'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
