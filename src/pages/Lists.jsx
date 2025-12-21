import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchMovies } from '../api/tmdb';
import axios from 'axios';

export default function Lists() {
  const [movies, setMovies] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [rating, setRating] = useState('');
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setLoading(true);
    // Fetch user profile
    axios.get('/api/user/profile', { headers: { Authorization: `Bearer ${token}` }, withCredentials: true })
      .then(res => setUser(res.data?.user || null))
      .catch(() => setUser(null));
    // Fetch list
    axios.get('/api/list', { headers: { Authorization: `Bearer ${token}` }, withCredentials: true })
      .then(res => setMovies(res.data?.movies || []))
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (search.length > 1) {
      searchMovies(search).then(res => {
        setSearchResults(res.results || []);
      });
    } else {
      setSearchResults([]);
    }
  }, [search]);

  const removeMovie = async (tmdbId) => {
    const token = localStorage.getItem('token');
    setLoading(true);
    await axios.delete(`/api/list/${tmdbId}`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
    // Refresh list
    axios.get('/api/list', { headers: { Authorization: `Bearer ${token}` }, withCredentials: true })
      .then(res => setMovies(res.data?.movies || []))
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    if (!selectedMovie) return;
    const token = localStorage.getItem('token');
    setLoading(true);
    await axios.post('/api/list', {
      tmdbId: selectedMovie.id,
      title: selectedMovie.title,
      poster: selectedMovie.poster_path ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}` : '',
      posterUrl: selectedMovie.poster_path ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}` : '',
      overview: selectedMovie.overview,
      releaseDate: selectedMovie.release_date,
      voteAverage: selectedMovie.vote_average,
      genreIds: selectedMovie.genre_ids,
      rating: rating ? parseFloat(rating) : undefined,
      review,
    }, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
    // Refresh list
    axios.get('/api/list', { headers: { Authorization: `Bearer ${token}` }, withCredentials: true })
      .then(res => setMovies(res.data?.movies || []))
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
    setShowAdd(false);
    setSearch('');
    setSearchResults([]);
    setSelectedMovie(null);
    setRating('');
    setReview('');
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-[#181c24] via-[#232526] to-[#0a1833] text-white p-6 flex flex-col items-center relative">
        {/* Logo */}
        <div className="absolute top-4 left-4 z-50 select-none">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span className="text-lg font-extrabold tracking-tight font-playfair text-white px-4 py-1 rounded-full shadow-lg bg-[#1e0000a0] border border-[#ffd6c1] hover:bg-[#ffd6c133] transition-colors" style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.04em', textShadow: '0 2px 8px #2d0101' }}>
              visual.cineaste
            </span>
          </Link>
        </div>
        {/* User section from backend */}
        {user && (
          <div className="flex items-center gap-4 mb-6 mt-8 bg-[#232526] px-6 py-4 rounded-xl shadow-lg border border-cyan-700">
            <img src={user.avatarUrl || 'https://placehold.co/60x60?text=User'} alt={user.username} className="w-14 h-14 rounded-full object-cover border-2 border-cyan-400" />
            <div>
              <div className="font-bold text-xl text-cyan-200">{user.username}</div>
              {user.email && <div className="text-sm text-gray-400">{user.email}</div>}
              {/* Add more user stats/info here if available */}
            </div>
          </div>
        )}
        <h1 className="text-3xl font-extrabold mb-4 font-playfair tracking-tight text-cyan-300 drop-shadow-lg">Your Watched & Rated Movies</h1>
        <button
          className="mb-6 px-5 py-2 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold shadow-lg transition-all"
          onClick={() => setShowAdd(v => !v)}
        >{showAdd ? 'Cancel' : 'Add Movie +'}</button>
        {showAdd && (
          <form onSubmit={handleAddMovie} className="w-full max-w-md bg-[#232526] rounded-xl shadow-lg p-6 mb-8 flex flex-col gap-3 border border-cyan-700 relative">
            {/* ...existing code... */}
            <input
              className="bg-[#181c24] text-white rounded px-3 py-2 mb-2 outline-none border border-cyan-900 focus:border-cyan-400"
              placeholder="Search for a movie..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setSelectedMovie(null);
              }}
              autoFocus
            />
            {/* ...existing code... */}
            {searchResults.length > 0 && !selectedMovie && (
              <div className="absolute left-0 right-0 top-16 z-50 bg-[#232526] border border-cyan-900 rounded shadow-lg max-h-64 overflow-y-auto">
                {searchResults.slice(0, 8).map(m => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-cyan-900/30 cursor-pointer border-b border-[#232526] last:border-b-0"
                    onClick={() => { setSelectedMovie(m); setSearch(m.title); }}
                  >
                    <img src={m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : 'https://placehold.co/60x90?text=No+Image'} alt={m.title} className="w-10 h-14 object-cover rounded" />
                    <div>
                      <div className="font-semibold text-cyan-200">{m.title}</div>
                      <div className="text-xs text-gray-400">{m.release_date ? m.release_date.slice(0, 4) : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* ...existing code... */}
            {selectedMovie && (
              <div className="flex flex-col items-center mb-2 mt-2">
                <img src={selectedMovie.poster_path ? `https://image.tmdb.org/t/p/w200${selectedMovie.poster_path}` : 'https://placehold.co/120x180?text=No+Image'} alt={selectedMovie.title} className="w-24 h-36 object-cover rounded mb-2" />
                <div className="font-bold text-lg text-cyan-200">{selectedMovie.title} {selectedMovie.release_date && <span className="text-xs text-gray-400">({selectedMovie.release_date.slice(0, 4)})</span>}</div>
              </div>
            )}
            {/* ...existing code... */}
            {selectedMovie && (
              <>
                <input
                  className="bg-[#181c24] text-white rounded px-3 py-2 mb-2 outline-none border border-cyan-900 focus:border-cyan-400"
                  placeholder="Your Rating (0-10)"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={rating}
                  onChange={e => setRating(e.target.value)}
                />
                <textarea
                  className="bg-[#181c24] text-white rounded px-3 py-2 mb-2 outline-none border border-cyan-900 focus:border-cyan-400"
                  placeholder="Your Review (optional)"
                  value={review}
                  onChange={e => setReview(e.target.value)}
                  rows={2}
                />
                <button type="submit" className="mt-2 px-4 py-2 bg-cyan-600 rounded-full font-bold hover:bg-cyan-700 transition-all">Add to List</button>
              </>
            )}
          </form>
        )}
        {movies.length === 0 ? (
          <div className="text-gray-400 text-lg mt-10">No movies in your list yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-6xl">
            {movies.map(movie => (
              <div key={movie.tmdbId || movie.id} className="bg-[#232526] rounded-2xl shadow-xl border border-cyan-900 hover:border-cyan-400 transition-all p-4 flex flex-col items-center group relative overflow-hidden">
                <Link to={`/movie/${movie.tmdbId || movie.id}`} className="w-full flex flex-col items-center">
                  <img
                    src={movie.posterUrl || movie.poster || 'https://placehold.co/220x320?text=No+Image'}
                    alt={movie.title}
                    className="w-40 h-60 object-cover rounded-xl mb-3 shadow-lg group-hover:scale-105 transition-transform duration-200 bg-gray-900"
                    loading="lazy"
                  />
                  <div className="font-bold text-lg text-center text-cyan-200 mb-1 font-playfair">{movie.title} {movie.releaseDate && <span className="text-xs text-gray-400">({movie.releaseDate.slice(0, 4)})</span>}</div>
                </Link>
                {movie.rating !== undefined && <div className="text-yellow-300 font-bold text-base mb-1">★ {movie.rating}</div>}
                {movie.review && <div className="text-xs text-cyan-100 italic mb-2 text-center">{movie.review}</div>}
                <button onClick={() => removeMovie(movie.tmdbId || movie.id)} className="mt-2 px-4 py-1 bg-red-600 rounded-full text-xs font-bold hover:bg-red-700 transition-all">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
}
