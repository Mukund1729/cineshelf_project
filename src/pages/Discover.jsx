// --- Mood Filter Data ---
const moods = [
  {
    name: "Romantic",
    color: "#dc2626",
    bgColor: "#dc2626",
    bgPoster: "/in-the-mood-for-love.jpeg",
    accentColor: "#ef4444",
    gradient: "from-red-600 to-red-500"
  },
  {
    name: "Melancholic",
    color: "#f472b6",
    bgColor: "#f472b6",
    bgPoster: "/wp2392788.webp",
    accentColor: "#f9a8d4",
    gradient: "from-pink-400 to-pink-300"
  },
  {
    name: "Intense",
    color: "#6b7280",
    bgColor: "#6b7280",
    bgPoster: "/whiplash.webp",
    accentColor: "#9ca3af",
    gradient: "from-gray-500 to-gray-400"
  },
  {
    name: "Feel-Good",
    color: "#3b82f6",
    bgColor: "#3b82f6",
    bgPoster: "/wp8872346.webp",
    accentColor: "#60a5fa",
    gradient: "from-blue-500 to-blue-400"
  },
  {
    name: "Stylish",
    color: "#f97316",
    bgColor: "#f97316",
    bgPoster: "/MV5BZjkxNDU3NDktNTcyYi00ZGEyLWI2OWMtYTNkYTgzYzI4MjQ0XkEyXkFqcGdeQVRoaXJkUGFydHlJbmdlc3Rpb25Xb3JrZmxvdw@@._V1_QL75_UX500_CR0,0,500,281_.webp",
    accentColor: "#fb923c",
    gradient: "from-orange-500 to-orange-400"
  }
];

// --- Discover Component ---


import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { searchMovies } from "../api/tmdb";
import moodPoster from "./in-the-mood-for-love.jpeg";


function Discover() {
  const [mode, setMode] = useState("discover");
  const [aiResults, setAIResults] = useState([]); // Raw AI movie objects or ask result
  const [moviesWithPosters, setMoviesWithPosters] = useState([]); // AI movie objects + posterUrl
  const [askResult, setAskResult] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMood, setSelectedMood] = useState(moods[0].name);
  const [bgPoster, setBgPoster] = useState(moods[0].bgPoster);
  const [primaryColor, setPrimaryColor] = useState(moods[0].color);
  const [currentMood, setCurrentMood] = useState(moods[0]);

  // Mood change handler
  const handleMoodChange = (mood) => {
    setSelectedMood(mood.name);
    setPrimaryColor(mood.color);
    setBgPoster(mood.bgPoster);
    setCurrentMood(mood);
    document.documentElement.style.setProperty('--primary-color', mood.color);
    document.documentElement.style.setProperty('--accent-color', mood.accentColor);
  };

  // Update background poster and body style on mood change
  useEffect(() => {
    const moodData = moods.find(m => m.name === selectedMood);
    if (moodData) {
      setBgPoster(moodData.bgPoster);
      setPrimaryColor(moodData.color);
      setCurrentMood(moodData);
      document.documentElement.style.setProperty('--primary-color', moodData.color);
      document.documentElement.style.setProperty('--accent-color', moodData.accentColor);
    }
  }, [selectedMood]);

  async function handleSearch(e) {
    e.preventDefault();
    setError("");
    setAskResult("");
    setMoviesWithPosters([]);
    setAIResults([]);
    setLoading(true);
    let cleaned = input && typeof input === 'string' ? input.replace(/\s+/g, ' ').trim() : '';
    if (!cleaned) {
      setError("Please enter a prompt.");
      setLoading(false);
      return;
    }

    // Helper to call LLM with optimized settings
    async function callLLM(messages) {
      const body = { 
        messages, 
        temperature: 0.3, // Lower temperature for more consistent results
        model: "mistralai/mistral-7b-instruct",
        max_tokens: 150 // Limit tokens for faster response
      };
     
      if (!res.ok) throw new Error(data.error || "AI error");
      let aiText = data.reply || (data.choices && data.choices[0]?.message?.content) || "";
      return aiText;
    }
     const res = await axios.post("/api/gpt", body);
     let data = res.data;
    // --- ASK MODE ---
    if (mode === "ask") {
      try {
        const messages = [
          { role: "system", content: "You are a helpful, concise movie expert. Answer the user's question about movies, film, or cinema. Be direct and insightful." },
          { role: "user", content: cleaned }
        ];
        const aiText = await callLLM(messages);
        setAskResult(aiText);
      } catch (err) {
        setError(err.message || "AI error");
      }
      setLoading(false);
      return;
    }

    // --- DISCOVER MODE ---
    // Helper to get movie titles from LLM (parsing JSON)
    async function getMoviesFromLLM(messages) {
      const aiText = await callLLM(messages);
      let titles;
      try {
        console.log('Raw AI output:', aiText);
        const parsed = JSON.parse(aiText);
        if (Array.isArray(parsed)) {
          titles = parsed;
        } else if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.movies)) {
            titles = parsed.movies;
          } else if (Array.isArray(parsed.movie_recommendations)) {
            titles = parsed.movie_recommendations;
          } else {
            const arrKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
            if (arrKey) {
              titles = parsed[arrKey];
            } else {
              throw new Error();
            }
          }
        } else {
          throw new Error();
        }
        if (!titles.length) throw new Error();
        console.log('Parsed movie titles:', titles);
      } catch {
        throw new Error("Could not parse AI response. Try another prompt.\n---\nRaw AI output: " + aiText);
      }
      return titles;
    }

    // First, try with mood
    const moodPrompt = `The user's current mood is: ${selectedMood}. Only recommend movies that fit this mood.`;
    let messages = [
      {
        role: "system",
        content: `You are a movie recommendation assistant. A user will give you a natural language query related to movies — it can be anything from an actor's name, a genre, a theme, or a sentence like “movies like Interstellar” or “funny movies about time travel”. Your job is to understand the meaning and return a JSON array of 5 to 6 movie titles that best match the intent of the query and the user's current mood. Only return the JSON array, no explanation.\n${moodPrompt}`
      },
      { role: "user", content: cleaned }
    ];
    let titles = [];
    try {
      titles = await getMoviesFromLLM(messages);
    } catch (err) {
      setError(err.message || "AI error");
      setLoading(false);
      return;
    }
    // Fetch TMDB metadata for each title
    let moviesWithPosters = await Promise.all(
      titles.slice(0, 6).map(async (titleRaw) => {
        try {
          let title = titleRaw;
          title = title.replace(/\s*\(\d{4}\).*/, "");
          title = title.split("-")[0].split(":")[0].trim();
          console.log('Searching TMDB for cleaned title:', title, '| Original:', titleRaw);
          const tmdbRes = await searchMovies(title);
          console.log('TMDB search for:', title, tmdbRes);
          const best = tmdbRes.results && tmdbRes.results.length > 0 ? tmdbRes.results[0] : null;
          if (!best || !best.poster_path) return null;
          return {
            title: best.title,
            year: best.release_date ? best.release_date.slice(0, 4) : "",
            posterUrl: `https://image.tmdb.org/t/p/w500${best.poster_path}`,
            rating: best.vote_average
          };
        } catch (err) {
          console.error('TMDB fetch error for', titleRaw, err);
          return null;
        }
      })
    );
    let filtered = moviesWithPosters.filter(Boolean);
    // Fallback: if no results, try again without mood
    if (filtered.length === 0) {
      try {
        messages = [
          {
            role: "system",
            content: "You are a movie recommendation assistant. A user will give you a natural language query related to movies — it can be anything from an actor's name, a genre, a theme, or a sentence like “movies like Interstellar” or “funny movies about time travel”. Your job is to understand the meaning and return a JSON array of 5 to 6 movie titles that best match the intent of the query. Only return the JSON array, no explanation."
          },
          { role: "user", content: cleaned }
        ];
        titles = await getMoviesFromLLM(messages);
        moviesWithPosters = await Promise.all(
          titles.slice(0, 6).map(async (titleRaw) => {
            try {
              let title = titleRaw;
              title = title.replace(/\s*\(\d{4}\).*/, "");
              title = title.split("-")[0].split(":")[0].trim();
              console.log('Searching TMDB for cleaned title:', title, '| Original:', titleRaw);
              const tmdbRes = await searchMovies(title);
              console.log('TMDB search for:', title, tmdbRes);
              const best = tmdbRes.results && tmdbRes.results.length > 0 ? tmdbRes.results[0] : null;
              if (!best || !best.poster_path) return null;
              return {
                title: best.title,
                year: best.release_date ? best.release_date.slice(0, 4) : "",
                posterUrl: `https://image.tmdb.org/t/p/w500${best.poster_path}`,
                rating: best.vote_average
              };
            } catch (err) {
              console.error('TMDB fetch error for', titleRaw, err);
              return null;
            }
          })
        );
        filtered = moviesWithPosters.filter(Boolean);
      } catch (err) {
        setError(err.message || "AI error");
        setLoading(false);
        return;
      }
    }
    setMoviesWithPosters(filtered);
    if (filtered.length === 0) {
      setError("No results found from TMDB. This may be a network issue, an invalid TMDB API key, or the AI suggested movies TMDB can't find. Check your API key and try a different prompt.");
    }
    setLoading(false);
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-sans">
      {/* Aesthetic In the Mood for Love background */}
      <div className="absolute inset-0 w-full h-full z-0" style={{
        background: `url(${bgPoster}) center center / cover no-repeat`,
        filter: 'blur(4px) brightness(0.5) saturate(1.2)',
        transition: 'background-image 1s, filter 1s',
      }} aria-hidden="true" />
      <div className="absolute inset-0 w-full h-full z-0" style={{
        background: `linear-gradient(135deg, ${currentMood.color}20 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.75) 100%)`,
        mixBlendMode: 'multiply', pointerEvents: 'none', transition: 'background 1s',
      }} aria-hidden="true" />
      
      {/* Cinematic overlay effects */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.4) 100%)',
      }} />
      <div className="absolute inset-0 z-20 pointer-events-none" style={{
        background: 'url("https://www.transparenttextures.com/patterns/asfalt-light.png") repeat', opacity: 0.015,
      }} />
      <div className="absolute inset-0 z-30 pointer-events-none" style={{
        background: 'linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.02) 25%, transparent 25%)',
        backgroundSize: '100px 100px',
        opacity: 0.3,
      }} />

      {/* Compact Professional Logo */}
      <div className="absolute top-6 left-6 z-50 select-none">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span className="text-lg font-bold tracking-tight font-playfair text-white px-4 py-2 rounded-full shadow-lg bg-black/30 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300" style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.02em', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            visual.cineaste
          </span>
        </Link>
      </div>

      {/* Enhanced Mood selector with dynamic colors */}
      <div className="flex gap-4 py-4 px-6 rounded-3xl bg-black/50 backdrop-blur-2xl shadow-2xl mt-16 z-30 border border-white/10">
        {moods.map((mood) => (
          <button
            key={mood.name}
            onClick={() => handleMoodChange(mood)}
            className={`rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-500 ${
              selectedMood === mood.name 
                ? 'text-white shadow-2xl scale-110' 
                : 'text-gray-300 hover:text-white hover:scale-105'
            }`}
            style={{ 
              background: selectedMood === mood.name 
                ? `linear-gradient(135deg, ${mood.color}40, ${mood.accentColor}20)` 
                : 'rgba(0,0,0,0.3)',
              border: selectedMood === mood.name 
                ? `2px solid ${mood.color}` 
                : "1px solid rgba(255,255,255,0.1)",
              boxShadow: selectedMood === mood.name 
                ? `0 8px 32px ${mood.color}40, inset 0 1px 0 rgba(255,255,255,0.1)` 
                : 'none'
            }}
          >
            {mood.name}
          </button>
        ))}
      </div>

            {/* Stretched Homepage-style Search section */}
      <div className="flex flex-col items-center w-full max-w-4xl mt-16 z-30 px-6">
        {/* Compact Mode toggle */}
        <div className="flex w-full gap-1 mb-6 bg-black/30 backdrop-blur-lg rounded-xl p-1 border border-white/10 shadow-lg">
          <button
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
              mode === "discover" 
                ? "text-white shadow-md" 
                : "text-gray-300 hover:text-white"
            }`}
            style={{
              background: mode === "discover" 
                ? `linear-gradient(135deg, ${currentMood.color}, ${currentMood.accentColor})` 
                : 'rgba(0,0,0,0.2)',
              boxShadow: mode === "discover" 
                ? `0 2px 12px ${currentMood.color}30` 
                : 'none'
            }}
            onClick={() => setMode("discover")}
            disabled={loading}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Discover</span>
            </span>
          </button>
          <button
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
              mode === "ask" 
                ? "text-white shadow-md" 
                : "text-gray-300 hover:text-white"
            }`}
            style={{
              background: mode === "ask" 
                ? `linear-gradient(135deg, ${currentMood.accentColor}, ${currentMood.color})` 
                : 'rgba(0,0,0,0.2)',
              boxShadow: mode === "ask" 
                ? `0 2px 12px ${currentMood.accentColor}30` 
                : 'none'
            }}
            onClick={() => setMode("ask")}
            disabled={loading}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Ask</span>
            </span>
          </button>
        </div>

        {/* Stretched Homepage-style Search form */}
        <form className="flex w-full bg-black/30 backdrop-blur-lg rounded-xl shadow-lg px-4 py-3 border border-white/10" onSubmit={handleSearch}>
          <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
              placeholder={mode === "discover" ? "Search movies by mood, genre, or description..." : "Ask about movies, directors, or cinema..."}
              className="w-full bg-transparent outline-none px-3 py-2 text-base text-white placeholder-gray-400 font-normal rounded-lg"
              style={{fontFamily:'Inter, sans-serif',letterSpacing:'0.01em'}}
            onFocus={e => e.target.select()}
            disabled={loading}
          />
          </div>
          <button
            type="submit"
            className="ml-3 px-6 py-2 rounded-lg text-sm font-medium text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/40"
            style={{
              background: `linear-gradient(135deg, ${currentMood.color}, ${currentMood.accentColor})`,
              boxShadow: `0 2px 12px ${currentMood.color}30`
            }}
            tabIndex={0}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Searching</span>
              </div>
            ) : (
              <span>Search</span>
            )}
          </button>
        </form>
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg text-center w-full backdrop-blur-sm text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Enhanced Results with dynamic colors */}
      <div className="relative z-40 flex flex-col items-center justify-center w-full h-full min-h-[60vh] mt-12 px-8">
        {mode === "ask" && askResult && (
          <div className="mt-8 p-10 rounded-3xl bg-black/50 backdrop-blur-2xl text-white max-w-5xl text-xl shadow-2xl border border-white/10 leading-relaxed">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{
                background: `linear-gradient(135deg, ${currentMood.color}, ${currentMood.accentColor})`
              }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">AI Response</h3>
            </div>
            <div className="prose prose-invert max-w-none text-lg">
              {askResult}
            </div>
          </div>
        )}
        
        {mode === "discover" && loading && (
          <div className="flex flex-col items-center justify-center w-full h-48">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-transparent" style={{
                borderTopColor: currentMood.color,
                borderRightColor: currentMood.accentColor
              }}></div>
            </div>
            <p className="text-white text-base font-medium mt-6" style={{color: currentMood.color}}>
              Discovering movies...
            </p>
          </div>
        )}
        

        
        {mode === "discover" && moviesWithPosters.length > 0 && (
          <div className="w-full max-w-7xl">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-14 h-14 rounded-3xl flex items-center justify-center shadow-2xl" style={{
                background: `linear-gradient(135deg, ${currentMood.color}, ${currentMood.accentColor})`,
                boxShadow: `0 8px 32px ${currentMood.color}40`
              }}>
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">Discoveries</h2>
                <p className="text-gray-300 text-sm">Found {moviesWithPosters.length} movies for you</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-8" id="ai-movie-results">
            {moviesWithPosters.map((movie, idx) => (
                <div key={idx} className="group">
                  <div className="relative overflow-hidden rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/30 transition-all duration-700 hover:scale-110 hover:shadow-2xl" style={{
                    boxShadow: `0 12px 40px ${currentMood.color}40`
                  }}>
                    <div className="relative">
                <img
                  src={movie.posterUrl ? movie.posterUrl : '/placeholder-movie.jpg'}
                  alt={movie.title}
                        className="w-full aspect-[2/3] object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      {movie.rating && (
                        <div className="absolute top-4 right-4 bg-yellow-500 text-black text-sm font-bold px-3 py-1 rounded-full shadow-2xl backdrop-blur-sm">
                          ★ {movie.rating.toFixed(1)}
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-700">
                        <p className="text-white text-sm font-semibold line-clamp-2 leading-tight">{movie.title}</p>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-white text-sm font-semibold truncate transition-colors duration-300 group-hover:text-opacity-80" style={{
                        fontFamily:'Inter, sans-serif'
                      }}>
                        {movie.title}
                      </h3>
                      {movie.year && (
                        <p className="text-gray-400 text-xs mt-2 font-medium">({movie.year})</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              </div>
          </div>
        )}
      </div>

      {/* Minimal quote in bottom left */}
      <div className="absolute bottom-6 left-6 z-50 text-[#ffd6c1] text-base font-serif opacity-80 select-none" style={{ fontFamily: 'Playfair Display, serif', maxWidth: 260 }}>
        <span style={{ textShadow: '0 2px 8px #2d0101' }}>
          “He remembers those vanished years…”
        </span>
      </div>
    </div>
  );
}
export default Discover;

