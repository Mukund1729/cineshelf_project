import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import fallbackData from '../boxoffice_fallback.json';

const START_YEAR = 1980;
const END_YEAR = new Date().getFullYear();
const LANGUAGES = [
  { code: '', label: '🌍 Global' },
  { code: 'hi', label: '🇮🇳 Hindi' },
  { code: 'ta', label: '🇮🇳 Tamil' },
  { code: 'te', label: '🇮🇳 Telugu' },
  { code: 'ml', label: '🇮🇳 Malayalam' },
  { code: 'kn', label: '🇮🇳 Kannada' },
];
const SORTS = [
  { value: 'revenue.desc', label: 'Revenue' },
  { value: 'popularity.desc', label: 'Popularity' },
  { value: 'vote_average.desc', label: 'Rating' },
];

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function BoxOfficeByYear() {
  const [year, setYear] = useState(END_YEAR);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [sort, setSort] = useState('revenue.desc');

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      setError(null);
      setMovies([]);
      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        let url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=${sort}&primary_release_year=${year}&page=1`;
        if (region) url += `&with_original_language=${region}`;
        if (search) url += `&query=${encodeURIComponent(search)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch movies');
        const data = await res.json();
        let movies = data.results || [];
        // Fallback for Indian languages if revenue is missing
        if (region && ['hi','ta','te','ml','kn'].includes(region)) {
          movies = movies.map(m => {
            if (!m.revenue || m.revenue === 0) {
              const fallback = fallbackData.find(f => f.title.toLowerCase() === m.title.toLowerCase() && f.year === year && f.language === region);
              if (fallback) {
                return { ...m, revenue: fallback.revenue_usd };
              }
            }
            return m;
          });
        }
        setMovies(movies);
      } catch (err) {
        setError('Could not load box office data.');
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, [year, region, sort, search]);

  return (
    <div>
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center mb-4">
        {/* Language Filter Bar */}
        <div className="flex gap-2 mb-2 md:mb-0">
          <button
            className={`px-3 py-1 rounded-full font-semibold text-xs md:text-sm transition-all ${region === '' ? 'bg-cyan-400 text-black shadow' : 'bg-[#232526] text-cyan-200 hover:bg-cyan-700 hover:text-white'}`}
            onClick={() => setRegion('')}
          >🌍 Global</button>
          <button
            className={`px-3 py-1 rounded-full font-semibold text-xs md:text-sm transition-all ${region === 'hi' ? 'bg-cyan-400 text-black shadow' : 'bg-[#232526] text-cyan-200 hover:bg-cyan-700 hover:text-white'}`}
            onClick={() => setRegion('hi')}
          >🇮🇳 Hindi</button>
          <button
            className={`px-3 py-1 rounded-full font-semibold text-xs md:text-sm transition-all ${region === 'ta' ? 'bg-cyan-400 text-black shadow' : 'bg-[#232526] text-cyan-200 hover:bg-cyan-700 hover:text-white'}`}
            onClick={() => setRegion('ta')}
          >🇮🇳 Tamil</button>
          <button
            className={`px-3 py-1 rounded-full font-semibold text-xs md:text-sm transition-all ${region === 'te' ? 'bg-cyan-400 text-black shadow' : 'bg-[#232526] text-cyan-200 hover:bg-cyan-700 hover:text-white'}`}
            onClick={() => setRegion('te')}
          >🇮🇳 Telugu</button>
          <button
            className={`px-3 py-1 rounded-full font-semibold text-xs md:text-sm transition-all ${region === 'ml' ? 'bg-cyan-400 text-black shadow' : 'bg-[#232526] text-cyan-200 hover:bg-cyan-700 hover:text-white'}`}
            onClick={() => setRegion('ml')}
          >🇮🇳 Malayalam</button>
          <button
            className={`px-3 py-1 rounded-full font-semibold text-xs md:text-sm transition-all ${region === 'kn' ? 'bg-cyan-400 text-black shadow' : 'bg-[#232526] text-cyan-200 hover:bg-cyan-700 hover:text-white'}`}
            onClick={() => setRegion('kn')}
          >🇮🇳 Kannada</button>
        </div>
        {/* Search Bar */}
        <input
          type="text"
          className="w-full md:w-72 px-4 py-2 rounded-lg bg-[#232526] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow"
          placeholder="Search by movie name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {/* Sort Dropdown */}
        <div className="flex-1 flex justify-end">
          <select
            className="px-3 py-2 rounded-lg bg-[#232526] text-cyan-200 font-semibold text-sm focus:outline-none border border-cyan-900"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            {SORTS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Year Scroller */}
      <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent px-2 py-1 rounded-lg bg-[#181c24]/60 mb-6">
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
      {/* Movies List */}
      <div className="container mx-auto px-0 pb-16">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-cyan-400 border-opacity-60"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-12">{error}</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl shadow-2xl bg-[#181c24]">
            <table className="min-w-full rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-cyan-900/60 text-cyan-200 text-lg">
                  <th className="px-4 py-3 text-left font-semibold font-playfair">#</th>
                  <th className="px-4 py-3 text-left font-semibold font-playfair">Title</th>
                  <th className="px-4 py-3 text-left font-semibold font-playfair">Year</th>
                  <th className="px-4 py-3 text-left font-semibold font-playfair">Box Office</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((movie, idx) => (
                  <tr key={movie.id} className="border-b border-gray-700 hover:bg-cyan-900/20 transition group">
                    <td className="px-4 py-2 text-cyan-300 font-bold text-lg">{idx + 1}</td>
                    <td className="px-4 py-2">
                      <Link to={`/movie/${movie.id}`} className="text-cyan-300 hover:underline font-semibold font-playfair group-hover:text-pink-300 transition flex items-center gap-2">
                        <img
                          src={movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : '/placeholder.jpg'}
                          alt={movie.title}
                          className="w-10 h-16 object-cover rounded bg-gray-800 inline-block"
                        />
                        <span className="truncate max-w-[180px]">{movie.title}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-gray-200">{movie.release_date ? movie.release_date.slice(0, 4) : 'N/A'}</td>
                    <td className="px-4 py-2 text-green-300 font-bold">{typeof movie.revenue === 'number' && movie.revenue > 0 ? `$${movie.revenue.toLocaleString()}` : movie.revenue === 0 ? '$0' : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
