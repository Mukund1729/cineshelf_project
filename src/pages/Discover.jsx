import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { searchMovies } from "../api/tmdb";
import axios from 'axios';

// --- Import Images ---
import romanticImg from '../9654063.webp'; 
import melancholicImg from '../wp2392788.webp';
import intenseImg from '../whiplash.webp';
import feelGoodImg from '../wp8872346.webp';
import stylishImg from '../MV5BZjkxNDU3NDktNTcyYi00ZGEyLWI2OWMtYTNkYTgzYzI4MjQ0XkEyXkFqcGdeQVRoaXJkUGFydHlJbmdlc3Rpb25Xb3JrZmxvdw@@._V1_QL75_UX500_CR0,0,500,281_.webp';


const BACKEND_URL = 'https://cineshelf-project.onrender.com';

// --- Mood Filter Data ---
const moods = [
  {
    name: "Romantic",
    color: "#dc2626",
    bgColor: "#dc2626",
    bgPoster: romanticImg,
    accentColor: "#ef4444",
    gradient: "from-red-600 to-red-500"
  },
  {
    name: "Melancholic",
    color: "#f472b6",
    bgColor: "#f472b6",
    bgPoster: melancholicImg,
    accentColor: "#f9a8d4",
    gradient: "from-pink-400 to-pink-300"
  },
  {
    name: "Intense",
    color: "#6b7280",
    bgColor: "#6b7280",
    bgPoster: intenseImg,
    accentColor: "#9ca3af",
    gradient: "from-gray-500 to-gray-400"
  },
  {
    name: "Feel-Good",
    color: "#3b82f6",
    bgColor: "#3b82f6",
    bgPoster: feelGoodImg,
    accentColor: "#60a5fa",
    gradient: "from-blue-500 to-blue-400"
  },
  {
    name: "Stylish",
    color: "#f97316",
    bgColor: "#f97316",
    bgPoster: stylishImg,
    accentColor: "#fb923c",
    gradient: "from-orange-500 to-orange-400"
  }
];

function Discover() {
  const [mode, setMode] = useState("discover");
  const [moviesWithPosters, setMoviesWithPosters] = useState([]); 
  const [askResult, setAskResult] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMood, setSelectedMood] = useState(moods[0].name);
  const [bgPoster, setBgPoster] = useState(moods[0].bgPoster);
  const [primaryColor, setPrimaryColor] = useState(moods[0].color);
  const [currentMood, setCurrentMood] = useState(moods[0]);

  const handleMoodChange = (mood) => {
    setSelectedMood(mood.name);
    setPrimaryColor(mood.color);
    setBgPoster(mood.bgPoster);
    setCurrentMood(mood);
    document.documentElement.style.setProperty('--primary-color', mood.color);
    document.documentElement.style.setProperty('--accent-color', mood.accentColor);
  };

  useEffect(() => {
    const moodData = moods.find(m => m.name === selectedMood);
    if (moodData) {
      setBgPoster(moodData.bgPoster);
      setPrimaryColor(moodData.color);
      setCurrentMood(moodData);
    }
  }, [selectedMood]);

  async function handleSearch(e) {
    e.preventDefault();
    setError("");
    setAskResult("");
    setMoviesWithPosters([]);
    setLoading(true);

    let cleaned = input && typeof input === 'string' ? input.trim() : '';
    if (!cleaned) {
      setError("Please enter a prompt.");
      setLoading(false);
      return;
    }

    // ✅ Helper to call LLM using the FULL BACKEND URL
    async function callLLM(messages) {
      const body = { 
        messages, 
        temperature: 0.5,
        model: "mistralai/mistral-7b-instruct",
        max_tokens: 400
      };
      
      // Explicitly pointing to Render backend
      const res = await axios.post(`${BACKEND_URL}/api/gpt`, body);
      return res.data.reply || "";
    }

    // --- ASK MODE ---
    if (mode === "ask") {
      try {
        const messages = [
          { role: "system", content: "You are a movie expert. Answer concisely." },
          { role: "user", content: cleaned }
        ];
        const aiText = await callLLM(messages);
        setAskResult(aiText);
      } catch (err) {
        console.error("AI API Error:", err);
        setError("AI Error: Check backend logs/CORS.");
      }
      setLoading(false);
      return;
    }

    // --- DISCOVER MODE ---
    try {
      const moodPrompt = `The user's current mood is: ${selectedMood}.`;
      const messages = [
        {
          role: "system",
          content: `Return ONLY a JSON array of 6 movie titles. No extra text. ${moodPrompt}`
        },
        { role: "user", content: cleaned }
      ];

      const aiText = await callLLM(messages);
      let titles = [];

      try {
        // Extracts [...] even if AI adds conversational text
        const jsonMatch = aiText.match(/\[.*\]/s);
        titles = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiText);
      } catch (e) {
        titles = aiText.split('\n').filter(t => t.trim().length > 2).slice(0, 6);
      }

      const results = await Promise.all(
        titles.map(async (titleRaw) => {
          try {
            // Cleans title from numbering and years for better TMDB matching
            let cleanTitle = titleRaw.replace(/\s*\(\d{4}\).*/, "").replace(/^\d+[\.\)]\s*/, "").trim();
            const tmdbRes = await searchMovies(cleanTitle);
            const best = tmdbRes.results?.[0];
            if (!best || !best.poster_path) return null;
            return {
              id: best.id,
              title: best.title,
              year: best.release_date?.slice(0, 4),
              posterUrl: `https://image.tmdb.org/t/p/w500${best.poster_path}`,
              rating: best.vote_average
            };
          } catch { return null; }
        })
      );

      const filtered = results.filter(Boolean);
      setMoviesWithPosters(filtered);
      if (filtered.length === 0) setError("No matching movies found on TMDB.");

    } catch (err) {
      console.error("Discovery Error:", err);
      setError("AI Discovery failed. Backend might be sleeping or unreachable.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-sans">
      {/* Background Section */}
      <div className="absolute inset-0 w-full h-full z-0" style={{
        background: `url(${bgPoster}) center center / cover no-repeat`,
        filter: 'blur(4px) brightness(0.4)',
        transition: 'all 1s ease-in-out',
      }} />
      <div className="absolute inset-0 w-full h-full z-0" style={{
        background: `linear-gradient(135deg, ${currentMood.color}20 0%, rgba(0,0,0,0.8) 100%)`,
      }} />
      
      {/* Visual Overlays */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)' }} />

      {/* Navigation Logo */}
      <div className="absolute top-6 left-6 z-50">
        <Link to="/" className="text-xl font-bold font-playfair text-white px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/5 transition-all">
          visual.cineaste
        </Link>
      </div>

      {/* Mood Chips */}
      <div className="flex gap-3 py-4 px-6 rounded-3xl bg-black/50 backdrop-blur-2xl shadow-2xl mt-16 z-30 border border-white/10 max-w-[95vw] overflow-x-auto no-scrollbar">
        {moods.map((mood) => (
          <button
            key={mood.name}
            onClick={() => handleMoodChange(mood)}
            className={`rounded-2xl px-6 py-2 text-sm font-semibold transition-all duration-500 whitespace-nowrap ${
              selectedMood === mood.name ? 'text-white scale-110' : 'text-gray-400 hover:text-white'
            }`}
            style={{ 
              background: selectedMood === mood.name ? `linear-gradient(135deg, ${mood.color}40, ${mood.accentColor}20)` : 'transparent',
              border: selectedMood === mood.name ? `2px solid ${mood.color}` : "1px solid rgba(255,255,255,0.1)"
            }}
          >
            {mood.name}
          </button>
        ))}
      </div>

      {/* AI Search Interface */}
      <div className="flex flex-col items-center w-full max-w-4xl mt-12 z-30 px-6">
        <div className="flex w-full gap-2 mb-6 bg-black/30 backdrop-blur-lg rounded-xl p-1 border border-white/10">
          <button 
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "discover" ? "bg-white/10 text-white" : "text-gray-500"}`} 
            onClick={() => setMode("discover")}
          >
            Discover
          </button>
          <button 
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "ask" ? "bg-white/10 text-white" : "text-gray-500"}`} 
            onClick={() => setMode("ask")}
          >
            Ask Expert
          </button>
        </div>

        <form className="flex w-full bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl px-5 py-3 border border-white/10" onSubmit={handleSearch}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={mode === "discover" ? "Describe a vibe, movie theme, or plot..." : "Ask anything about filmmakers or cinema..."}
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-lg"
            disabled={loading}
          />
          <button 
            type="submit" 
            className="ml-4 px-8 py-2 rounded-xl text-white font-bold transition-all hover:brightness-125" 
            style={{ background: `linear-gradient(135deg, ${currentMood.color}, ${currentMood.accentColor})` }}
            disabled={loading}
          >
            {loading ? "..." : "Search"}
          </button>
        </form>
        {error && <div className="mt-4 p-3 bg-red-900/30 text-red-300 border border-red-500/50 rounded-lg text-sm w-full text-center">{error}</div>}
      </div>

      {/* Dynamic Results Area */}
      <div className="relative z-40 flex flex-col items-center w-full mt-10 px-8 pb-20 overflow-y-auto max-h-[55vh] no-scrollbar">
        {mode === "ask" && askResult && (
          <div className="p-8 rounded-3xl bg-black/60 backdrop-blur-3xl text-white max-w-4xl text-lg shadow-2xl border border-white/10 leading-relaxed font-light">
            {askResult}
          </div>
        )}
        
        {loading && (
          <div className="flex flex-col items-center gap-4 mt-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
            <span className="text-white/50 text-sm animate-pulse">Consulting the archives...</span>
          </div>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-6 w-full max-w-7xl">
          {moviesWithPosters.map((movie, idx) => (
            <Link 
              key={idx} 
              to={`/movie/${movie.id}`} 
              className="group relative overflow-hidden rounded-2xl bg-black/40 border border-white/10 hover:scale-105 transition-all duration-500 shadow-xl"
            >
              <img src={movie.posterUrl} alt={movie.title} className="w-full aspect-[2/3] object-cover transition-all duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all p-4 flex flex-col justify-end">
                <p className="text-white text-xs font-bold truncate">{movie.title}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-400 text-[10px]">{movie.year}</span>
                  <span className="text-yellow-400 text-[10px] font-bold">★ {movie.rating?.toFixed(1)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer Quote */}
      <div className="absolute bottom-6 left-6 z-50 text-white/30 text-xs italic font-serif tracking-widest uppercase pointer-events-none">
        “He remembers those vanished years…”
      </div>
    </div>
  );
}

export default Discover;
