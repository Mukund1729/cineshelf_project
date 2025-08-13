import React, { useState, useEffect } from 'react';
import boxofficeFallback from '../boxoffice_fallback.json';

const LANGUAGES = [
  { code: 'all', label: 'All' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'kn', label: 'Kannada' },
];
const LANGUAGE_MAP = {
  hi: 'Hindi', ta: 'Tamil', te: 'Telugu', ml: 'Malayalam', kn: 'Kannada',
};
const FALLBACK_POSTER = '/actor-placeholder.jpg';
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const YEARS = Array.from({ length: 2025 - 2010 + 1 }, (_, i) => 2025 - i);

function formatINR(num) {
  if (!num || isNaN(num)) return '₹0';
  return '₹' + num.toLocaleString('en-IN');
}
function formatUSD(num) {
  if (!num || isNaN(num)) return '$0';
  return '$' + num.toLocaleString('en-US');
}

function getRevenueForMovie(title, year, language) {
  // Try to find a revenue entry in the fallback JSON
  const match = boxofficeFallback.find(
    m => m.title.toLowerCase() === title.toLowerCase() && String(m.year) === String(year) && m.language === language
  );
  return match ? {
    inr: match.revenue_inr,
    usd: match.revenue_usd,
  } : null;
}

export default function BoxOfficeIndia() {
  const [language, setLanguage] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('revenue');
  const [year, setYear] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch TMDB data and merge with local revenue
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      let all = [];
      const langList = language === 'all' ? LANGUAGES.filter(l => l.code !== 'all').map(l => l.code) : [language];
      const yearList = year ? [Number(year)] : YEARS;
      for (const lang of langList) {
        for (const y of yearList) {
          const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&region=IN&sort_by=revenue.desc&with_original_language=${lang}&primary_release_year=${y}`;
          try {
            const res = await fetch(url);
            const data = await res.json();
            if (data && data.results) {
              for (const m of data.results.slice(0, 10)) {
                // Try to get revenue from fallback
                const revenue = getRevenueForMovie(m.title, y, lang);
                all.push({
                  title: m.title,
                  year: y,
                  language: lang,
                  poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : FALLBACK_POSTER,
                  revenue_inr: revenue ? revenue.inr : null,
                  revenue_usd: revenue ? revenue.usd : null,
                  tmdb_revenue: m.revenue || null,
                  popularity: m.popularity,
                  director: null, // Optionally fetch credits for director
                  runtime: m.runtime || null,
                });
              }
            }
          } catch (e) {
            // Ignore errors for now
          }
        }
      }
      setMovies(all);
      setLoading(false);
    }
    fetchData();
  }, [language, year]);

  // Filter, search, sort
  let filtered = movies;
  if (search) filtered = filtered.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));
  if (sort === 'revenue') filtered = filtered.slice().sort((a, b) => {
    const aRev = a.revenue_inr || a.tmdb_revenue || 0;
    const bRev = b.revenue_inr || b.tmdb_revenue || 0;
    return bRev - aRev;
  });
  if (sort === 'year') filtered = filtered.slice().sort((a, b) => (b.year || 0) - (a.year || 0));
  if (sort === 'popularity') filtered = filtered.slice().sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

  // Highest-grossing movie
  const highest = filtered[0];

  // Get unique years for year strip
  const years = Array.from(new Set(movies.map(m => m.year))).sort((a, b) => b - a);

  return (
    <div>
      {/* Highest-Grossing Banner */}
      {highest && highest.title && (
        <div className="mb-6 flex items-center gap-4 bg-gradient-to-r from-cyan-900 via-cyan-700 to-cyan-400 rounded-lg p-4 shadow-lg">
          <img src={highest.poster} alt={highest.title} className="w-16 h-24 object-cover rounded shadow border-2 border-cyan-200" onError={e => { e.target.onerror = null; e.target.src = FALLBACK_POSTER; }} />
          <div>
            <div className="text-xs uppercase tracking-widest text-cyan-100 font-bold">Highest-Grossing Indian Movie</div>
            <div className="text-lg md:text-2xl font-bold text-white">{highest.title}</div>
            <div className="text-cyan-100 text-sm">{highest.year} • {LANGUAGE_MAP[highest.language] || highest.language}</div>
            <div className="text-cyan-200 text-lg font-bold mt-1">
              {currency === 'INR'
                ? (highest.revenue_inr ? formatINR(highest.revenue_inr) : highest.tmdb_revenue ? formatINR(highest.tmdb_revenue) : 'N/A')
                : (highest.revenue_usd ? formatUSD(highest.revenue_usd) : highest.tmdb_revenue ? formatUSD(highest.tmdb_revenue / 83) : 'N/A')}
            </div>
          </div>
          <button
            className="ml-auto px-3 py-1 rounded-full bg-cyan-200 text-cyan-900 font-semibold text-xs hover:bg-cyan-100 transition"
            onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
          >
            View in {currency === 'INR' ? 'USD' : 'INR'}
          </button>
        </div>
      )}
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {LANGUAGES.map(l => (
          <button
            key={l.code}
            className={`px-4 py-1 rounded-full font-semibold text-sm transition-all ${language === l.code ? 'bg-cyan-400 text-black shadow' : 'bg-[#232526] text-cyan-200 hover:bg-cyan-700 hover:text-white'}`}
            onClick={() => setLanguage(l.code)}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 items-center mb-4 justify-between">
        <input
          className="bg-[#181c24] border border-cyan-700 rounded px-3 py-2 text-white w-48 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          placeholder="Search movies..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="bg-[#181c24] border border-cyan-700 rounded px-3 py-2 text-white"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="revenue">Sort by Revenue</option>
          <option value="year">Sort by Year</option>
          <option value="popularity">Sort by Popularity</option>
        </select>
        <button
          className="ml-2 px-3 py-2 rounded-full bg-cyan-900 text-cyan-100 font-semibold text-xs hover:bg-cyan-700 transition"
          onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
        >
          {currency === 'INR' ? 'Show USD' : 'Show INR'}
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {years.map(y => (
          <button
            key={y}
            className={`px-3 py-1 rounded-full font-semibold text-xs transition-all ${String(year) === String(y) ? 'bg-cyan-400 text-black shadow' : 'bg-[#232526] text-cyan-200 hover:bg-cyan-700 hover:text-white'}`}
            onClick={() => setYear(String(y) === String(year) ? '' : String(y))}
          >
            {y}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center text-cyan-300 py-8">Loading movies...</div>
        ) : (
          <table className="min-w-full text-sm md:text-base bg-[#181c24] rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-[#232526] text-cyan-200">
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">Poster</th>
                <th className="px-2 py-2">Title</th>
                <th className="px-2 py-2">Year</th>
                <th className="px-2 py-2">Language</th>
                <th className="px-2 py-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-cyan-300">No movies found.</td>
                </tr>
              )}
              {filtered.map((m, i) => (
                <tr key={m.title + m.year + m.language} className="border-b border-[#232526] hover:bg-[#232526]/60 transition-all">
                  <td className="px-2 py-2 text-center">{i + 1}</td>
                  <td className="px-2 py-2 text-center">
                    <img src={m.poster} alt={m.title} className="w-12 h-16 object-cover rounded shadow" onError={e => { e.target.onerror = null; e.target.src = FALLBACK_POSTER; }} />
                  </td>
                  <td className="px-2 py-2 font-semibold text-cyan-100">{m.title}</td>
                  <td className="px-2 py-2 text-center">{m.year}</td>
                  <td className="px-2 py-2 text-center uppercase">{LANGUAGE_MAP[m.language] || m.language}</td>
                  <td className="px-2 py-2 text-right font-bold text-cyan-300">
                    {currency === 'INR'
                      ? (m.revenue_inr ? formatINR(m.revenue_inr) : m.tmdb_revenue ? formatINR(m.tmdb_revenue) : 'N/A')
                      : (m.revenue_usd ? formatUSD(m.revenue_usd) : m.tmdb_revenue ? formatUSD(m.tmdb_revenue / 83) : 'N/A')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
