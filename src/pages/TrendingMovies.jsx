import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getWeeklyTrendingMovies } from '../api/tmdb';
import LoadingSpinner from '../components/LoadingSpinner';
import logo from '../Screenshot 2025-06-22 175951.png';

export function TrendingMovies() {
  const { data, status, error } = useQuery({
    queryKey: ['trending-movies'],
    queryFn: () => getWeeklyTrendingMovies(),
  });

  if (status === 'pending') return <LoadingSpinner />;
  if (status === 'error') return <div className="text-center text-red-400 py-12">Error: {error.message}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#181c24] to-[#1a1333] text-white font-lato relative overflow-x-hidden">
      {/* Logo Row */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center w-full px-8 py-4 bg-gradient-to-b from-black/80 via-[#181c24]/60 to-transparent backdrop-blur-md">
        <div className="flex items-center cursor-pointer" onClick={() => window.location.href = '/'}>
          <img
            src={logo}
            alt="cineshelf logo"
            className="h-10 w-auto rounded-xl shadow-lg border-2 border-white bg-white object-contain transition-transform hover:scale-105"
            style={{ boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.25)' }}
          />
        </div>
        <h1 className="ml-6 text-2xl font-bold font-playfair text-pink-300 tracking-wide select-none">Trending Movies</h1>
      </div>
      <div className="pt-24 pb-16 container mx-auto px-4">
        <h2 className="text-4xl font-bold font-playfair text-pink-400 mb-10 mt-10 text-center">Trending Movies</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {data?.filter(m => m.poster_path).map(movie => (
            <Link to={`/movie/${movie.id}`} key={movie.id} className="movie-card bg-[#181c24] rounded-xl overflow-hidden shadow-2xl flex flex-col items-center hover:scale-105 hover:shadow-pink-400 transition-transform duration-200 cursor-pointer">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-72 object-cover rounded-t-xl"
                onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'; }}
              />
              <h3 className="text-white font-semibold text-base text-center p-2 line-clamp-2 font-lato">{movie.title}</h3>
              <span className="text-pink-300 font-bold mt-1 mb-2">⭐ {movie.vote_average?.toFixed(1) ?? 'N/A'}</span>
            </Link>
          ))}
        </div>
      </div>
      <footer className="bg-gray-800 py-2 w-full fixed bottom-0 left-0 z-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-gray-400 font-lato">© {new Date().getFullYear()} visual.cineaste. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}