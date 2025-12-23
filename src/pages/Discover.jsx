import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { searchMovies } from "../api/tmdb";
import axios from 'axios';
import { FiClock, FiSearch, FiMessageSquare, FiFilm, FiMenu, FiTrash2, FiX } from "react-icons/fi";

// --- Import Images Correctly ---
import romanticImg from '../9654063.webp'; 
import melancholicImg from '../wp2392788.webp';
import intenseImg from '../whiplash.webp';
import feelGoodImg from '../wp8872346.webp';
import stylishImg from '../MV5BZjkxNDU3NDktNTcyYi00ZGEyLWI2OWMtYTNkYTgzYzI4MjQ0XkEyXkFqcGdeQVRoaXJkUGFydHlJbmdlc3Rpb25Xb3JrZmxvdw@@._V1_QL75_UX500_CR0,0,500,281_.webp';

// Backend URL
const BACKEND_URL = 'https://cineshelf-project.onrender.com';

// --- Mood Filter Data ---
const moods = [
  { name: "Romantic", color: "#dc2626", bgColor: "#dc2626", bgPoster: romanticImg, accentColor: "#ef4444" },
  { name: "Melancholic", color: "#f472b6", bgColor: "#f472b6", bgPoster: melancholicImg, accentColor: "#f9a8d4" },
  { name: "Intense", color: "#6b7280", bgColor: "#6b7280", bgPoster: intenseImg, accentColor: "#9ca3af" },
  { name: "Feel-Good", color: "#3b82f6", bgColor: "#3b82f6", bgPoster: feelGoodImg, accentColor: "#60a5fa" },
  { name: "Stylish", color: "#f97316", bgColor: "#f97316", bgPoster: stylishImg, accentColor: "#fb923c" }
];

function Discover() {
  const [mode, setMode] = useState("discover");
  const [moviesWithPosters, setMoviesWithPosters] = useState([]); 
  const [askResult, setAskResult] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // UI State
  const [selectedMood, setSelectedMood] = useState(moods[0].name);
  const [bgPoster, setBgPoster] = useState(moods[0].bgPoster);
  const [primaryColor, setPrimaryColor] = useState(moods[0].color);
  const [currentMood, setCurrentMood] = useState(moods[0]);
  const [history, setHistory] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);

  // --- Load History on Mount ---
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const local = localStorage.getItem('searchHistory');
    if (local) setHistory(JSON.parse(local));

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get(`${BACKEND_URL}/api/user/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if(res.data && Array.isArray(res.data)) {
        setHistory(res.data);
        localStorage.setItem('searchHistory', JSON.stringify(res.data)); 
      }
    } catch (err) { }
  };

  // --- Save History ---
  const saveToHistory = async (query, type) => {
    const newItem = { query, type, timestamp: new Date() };
    const newHistory = [newItem, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    const token = localStorage.getItem('token');
    if (token) {
        try {
            await axios.post(`${BACKEND_URL}/api/user/history`, 
                { query, type },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) { console.error("Failed to save history to DB"); }
    }
  };

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

  // Main Search Function
  async function handleSearch(e, overrideInput = null) {
    if (e) e.preventDefault();
    
    const query = overrideInput || input;
    let cleaned = query && typeof query === 'string' ? query.trim() : '';
    
    if (!cleaned) {
      setError("Please enter a prompt.");
      return;
    }

    setError("");
    setAskResult("");
    setMoviesWithPosters([]);
    setLoading(true);
    setInput(cleaned);

    saveToHistory(cleaned, mode);

    async function callLLM(messages) {
      const body = { 
        messages, 
        temperature: 0.5,
        model: "mistralai/mistral-7b-instruct",
        max_tokens: 1000
      };
      const res = await axios.post(`${BACKEND_URL}/api/gpt`, body);
      return res.data.reply || "";
    }

    try {
      if (mode === "ask") {
        const messages = [
          { role: "system", content: "You are a professional film critic and historian. Provide a detailed, concise, and professional answer." },
          { role: "user", content: cleaned }
        ];
        const aiText = await callLLM(messages);
        
        try {
            const cleanText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
            if (cleanText.startsWith('{')) {
                const parsed = JSON.parse(cleanText);
                setAskResult(parsed.answer || parsed.reply || aiText);
            } else {
                setAskResult(aiText);
            }
        } catch {
            setAskResult(aiText);
        }
        
      } else {
        const moodPrompt = `The user's current mood is: ${selectedMood}.`;
        const messages = [
          {
            role: "system",
            content: `You are a film curator. Return ONLY a raw JSON array of 6 movie objects. Format: [{"title": "Name", "year": "YYYY", "reason": "Short reason why"}]. Do not add markdown formatting. ${moodPrompt}`
          },
          { role: "user", content: cleaned }
        ];

        const aiText = await callLLM(messages);
        let titles = [];

        try {
          let cleanJson = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
          const firstBracket = cleanJson.indexOf('[');
          const lastBracket = cleanJson.lastIndexOf(']');
          
          if (firstBracket !== -1 && lastBracket !== -1) {
            cleanJson = cleanJson.substring(firstBracket, lastBracket + 1);
            titles = JSON.parse(cleanJson);
          } else {
            const firstCurly = cleanJson.indexOf('{');
            const lastCurly = cleanJson.lastIndexOf('}');
            if (firstCurly !== -1 && lastCurly !== -1) {
               const jsonObj = JSON.parse(cleanJson.substring(firstCurly, lastCurly + 1));
               if (jsonObj.answer) {
                   setMode("ask");
                   setAskResult(jsonObj.answer);
                   setLoading(false);
                   return;
               }
            }
            throw new Error("Invalid JSON structure");
          }
        } catch (e) {
          console.error("JSON Parse fail, falling back to text");
          setMode("ask");
          setAskResult(aiText);
          setLoading(false);
          return;
        }

        const results = await Promise.all(
          titles.map(async (item) => {
            try {
              let searchTitle = typeof item === 'string' ? item : item.title;
              searchTitle = searchTitle.replace(/\s*\(\d{4}\).*/, "").trim();
              const tmdbRes = await searchMovies(searchTitle);
              const best = tmdbRes.results?.[0];
              if (!best || !best.poster_path) return null;
              return {
                id: best.id,
                title: best.title,
                year: best.release_date?.slice(0, 4),
                posterUrl: `https://image.tmdb.org/t/p/w500${best.poster_path}`,
                backdrop_path: best.backdrop_path,
                rating: best.vote_average,
                overview: best.overview,
                curatorNote: item.reason || "" 
              };
            } catch { return null; }
          })
        );

        const filtered = results.filter(Boolean);
        setMoviesWithPosters(filtered);
        if (filtered.length === 0) setError("No matching movies found in our archives.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Connection to the Curator (AI) failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden font-sans text-white">
      
      {/* --- LEFT SIDEBAR: HISTORY --- */}
      <aside className={`flex-shrink-0 bg-[#0d1117] border-r border-[#30363d] flex flex-col transition-all duration-300 z-50 ${showSidebar ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0'} overflow-hidden h-full fixed md:relative shadow-2xl`}>
        <div className="p-6 border-b border-[#30363d] flex items-center justify-between">
          <Link to="/" className="text-lg font-bold font-playfair tracking-wide text-white hover:text-cyan-400 transition-colors">
            visual.cineaste
          </Link>
          <button onClick={() => setShowSidebar(false)} className="md:hidden text-gray-400">
            <FiX />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <FiClock /> History
            </h3>
            {history.length > 0 && (
                <button 
                    onClick={() => { setHistory([]); localStorage.removeItem('searchHistory'); }} 
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                >
                    <FiTrash2 />
                </button>
            )}
          </div>

          <div className="space-y-2">
            {history.length === 0 && <p className="text-xs text-gray-600 italic">No search history.</p>}
            {history.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => {
                    setMode(item.type || 'discover');
                    handleSearch(null, item.query);
                    if(window.innerWidth < 768) setShowSidebar(false);
                }}
                className="p-3 rounded-lg bg-[#21262d] hover:bg-[#30363d] cursor-pointer transition-all group border border-transparent hover:border-gray-600"
              >
                <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-1">
                  {item.type === 'ask' ? <FiMessageSquare className="text-blue-400"/> : <FiFilm className="text-purple-400"/>}
                  <span className="truncate">{item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}</span>
                </div>
                <p className="text-xs text-gray-300 line-clamp-2 font-medium group-hover:text-white">
                  {item.query}
                </p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* --- RIGHT MAIN CONTENT --- */}
      <main className="flex-1 relative flex flex-col h-full w-full bg-black">
        
        {/* Toggle Sidebar Button (Mobile) */}
        {!showSidebar && (
            <button 
                onClick={() => setShowSidebar(true)}
                className="absolute top-4 left-4 z-50 p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-white/10 transition-colors"
            >
                <FiMenu />
            </button>
        )}

        {/* Dynamic Background */}
        <div className="absolute inset-0 w-full h-full z-0" style={{
          backgroundImage: `url(${bgPoster})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px) brightness(0.4)',
          transition: 'background-image 1s ease-in-out',
        }} />
        <div className="absolute inset-0 w-full h-full z-0" style={{
          background: `linear-gradient(135deg, ${currentMood.color}40 0%, #000000 90%)`,
        }} />
        
        {/* ✅ FIXED HEADER (Sticky Top) */}
        <div className="relative z-30 flex-shrink-0 w-full flex flex-col items-center pt-6 pb-2 px-4 md:px-10 bg-gradient-to-b from-black/90 via-black/60 to-transparent backdrop-blur-sm border-b border-white/5">
            
            {/* Mood Chips */}
            <div className="flex gap-3 py-2 px-1 max-w-full overflow-x-auto no-scrollbar mb-4">
                {moods.map((mood) => (
                <button
                    key={mood.name}
                    onClick={() => handleMoodChange(mood)}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 whitespace-nowrap border ${
                    selectedMood === mood.name 
                        ? 'text-white scale-105 shadow-lg border-white/20' 
                        : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
                    }`}
                    style={{ 
                    background: selectedMood === mood.name ? `linear-gradient(90deg, ${mood.color}, ${mood.accentColor})` : 'transparent',
                    }}
                >
                    {mood.name}
                </button>
                ))}
            </div>

            {/* Input Area */}
            <div className="w-full max-w-3xl flex flex-col gap-0 shadow-2xl rounded-2xl overflow-hidden border border-white/20 relative z-40">
                {/* Mode Tabs */}
                <div className="flex w-full bg-[#161b22]/90 backdrop-blur-md">
                    <button 
                        className={`flex-1 py-3 text-sm font-semibold tracking-wide transition-colors ${mode === "discover" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`} 
                        onClick={() => setMode("discover")}
                    >
                        Discover
                    </button>
                    <button 
                        className={`flex-1 py-3 text-sm font-semibold tracking-wide transition-colors ${mode === "ask" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`} 
                        onClick={() => setMode("ask")}
                    >
                        Ask Expert
                    </button>
                </div>

                {/* Input Field */}
                <form className="flex w-full bg-black/60 backdrop-blur-xl p-2" onSubmit={(e) => handleSearch(e)}>
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={mode === "discover" ? "Describe a vibe: '80s neon noir with synth music'..." : "Ask: 'Why is The Godfather a masterpiece?'..."}
                        className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-base md:text-lg px-4 py-3"
                        disabled={loading}
                    />
                    <button 
                        type="submit" 
                        className="px-6 md:px-8 py-2 rounded-xl text-white font-bold transition-all hover:scale-105 shadow-lg whitespace-nowrap" 
                        style={{ background: `linear-gradient(135deg, ${currentMood.color}, ${currentMood.accentColor})` }}
                        disabled={loading}
                    >
                        {loading ? <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div> : "Search"}
                    </button>
                </form>
            </div>
        </div>

        {/* ✅ SCROLLABLE CONTENT AREA */}
        <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar w-full px-4 md:px-10 pb-10">
            
            {/* Error Message */}
            {error && <div className="mt-6 mx-auto max-w-3xl px-6 py-3 bg-red-500/20 text-red-200 border border-red-500/50 rounded-lg text-sm backdrop-blur-md animate-fade-in text-center">{error}</div>}

            {/* LOADING STATE */}
            {loading && (
                <div className="flex flex-col items-center gap-4 mt-20 animate-pulse">
                    <div className="h-1 w-24 bg-white/20 rounded overflow-hidden">
                        <div className="h-full bg-white animate-progress"></div>
                    </div>
                    <span className="text-white/50 text-sm font-light tracking-widest uppercase">Consulting the archives...</span>
                </div>
            )}

            {/* ASK RESULTS */}
            {mode === "ask" && askResult && !loading && (
                <div className="mt-8 mx-auto p-8 rounded-2xl bg-[#161b22]/90 backdrop-blur-xl text-white max-w-4xl text-lg shadow-2xl border border-white/10 leading-relaxed font-light animate-fade-in">
                    <div className="flex items-center gap-2 mb-4 text-cyan-400">
                        <FiMessageSquare />
                        <span className="text-xs font-bold uppercase tracking-wider">Expert Analysis</span>
                    </div>
                    <div className="whitespace-pre-line text-gray-200">{askResult}</div>
                </div>
            )}

            {/* DISCOVER RESULTS GRID */}
            {mode === "discover" && !loading && moviesWithPosters.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full max-w-7xl mx-auto mt-8 animate-fade-in">
                {moviesWithPosters.map((movie, idx) => (
                    <Link 
                    key={idx} 
                    to={`/movie/${movie.id}`} 
                    className="group relative overflow-hidden rounded-xl bg-[#161b22] border border-gray-800 hover:border-gray-500 hover:scale-105 transition-all duration-500 shadow-2xl flex flex-col h-full"
                    >
                    <div className="relative aspect-[2/3] overflow-hidden">
                        <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                    </div>
                    
                    <div className="p-4 flex flex-col gap-1 bg-[#161b22] flex-1">
                        <h3 className="text-white font-bold text-sm leading-tight line-clamp-1">{movie.title}</h3>
                        <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                            <span>{movie.year}</span>
                            <span className="text-yellow-500 font-bold">★ {movie.rating?.toFixed(1)}</span>
                        </div>
                        {/* Curator Note from AI */}
                        {movie.curatorNote && (
                            <p className="text-[10px] text-cyan-200 italic leading-relaxed border-t border-gray-700 pt-2 mt-auto line-clamp-3">
                                "{movie.curatorNote}"
                            </p>
                        )}
                    </div>
                    </Link>
                ))}
                </div>
            )}

            {/* Footer Quote (Only show if no results yet to keep clean) */}
            {!loading && moviesWithPosters.length === 0 && !askResult && (
                <div className="mt-20 text-white/20 text-xs italic font-serif tracking-widest uppercase text-center">
                    “He remembers those vanished years…”
                </div>
            )}
        </div>
      </main>
    </div>
  );
}

export default Discover;
