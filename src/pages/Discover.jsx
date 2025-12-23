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
  { name: "Melancholic", color: "#f472b6", bgColor: "#f472b, 4),
                posterUrl: `https://image.tmdb.org/t/p/w500${best.poster_path}`,
                rating: best.vote_average,
                curatorNote: item.reason || "" 
              };
            } catch { return null; }
          })
        );
        
        const filtered = results.filter(Boolean);
        setMoviesWithPosters(filtered);
        if (filtered.length === 0) setError("No matching movies found.");
      }

    } catch (err) {
      console.error("Error:", err);
      setError("AI Service unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden font-sans text-white">
      
      {/* SIDEBAR */}
      <aside className={`flex-shrink-0 bg-[#0d1117] border-r border-[#30363d] flex flex-col transition-all duration-300 z-50 ${showSidebar ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0'} h-full fixed md:relative shadow-2xl`}>
        <div className="p-6 border-b border-[#30363d] flex items-center justify-between">discover' (Movie Cards) or 'ask' (Text)
  const [moviesWithPosters, setMoviesWithPosters] = useState([]); 
  const [askResult, setAskResult] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // UI State
  const [selectedMood, setSelectedMood] = useState(moods[0].name);
  const [bgPoster, setBgPoster] = useState(moods[0].bgPoster);
  const [currentMood, setCurrentMood] = useState(moods[0]);
  const [history, setHistory] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);

  // --- Load History ---
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    // 1. LocalStorage (Fast)
    const local = localStorage.getItem('searchHistory');
    if (local) setHistory(JSON.parse(local));

    // 2. Database (Sync)
    const token = localStorage.getItem('token');
    if (!token)6", bgPoster: melancholicImg, accentColor: "#f9a8d4" },
  { name: "Intense", color: "#6b7280", bgColor: "#6b7280", bgPoster: intenseImg, accentColor: "#9ca3af" },
  { name: "Feel-Good", color: "#3b82f6", bgColor: "#3b82f6", bgPoster: feelGoodImg, accentColor: "#60a5fa" },
  { name: "Stylish", color: "#f97316", bgColor: "#f97316", bgPoster: stylishImg, accentColor: "#fb923c" }
];

// ✅ Helper to make AI Text look professional (Bullets & Paragraphs)
const FormatAIResponse = ({ text }) => {
  return (
    <div className="space-y-3 text-gray-200 leading-relaxed text-sm md:text-base font-light">
      {text.split('\n').map((line, i) => {
        // Bullet points
        if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
          return (
            <div key={i}
          <Link to="/" className="text-lg font-bold font-playfair text-white hover:text-cyan-400 transition-colors">visual.cineaste</Link>
          <button onClick={() => setShowSidebar(false)} className="md:hidden text-gray-400"><FiX /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><FiClock /> Recent</h3>
          <div className="space-y-2">
            {history.map((item, idx) => (
              <div key={idx} onClick={() => { setMode(item.type || 'discover'); handleSearch(null, item.query); if(window.innerWidth < 768) setShowSidebar(false); }} className="p-3 rounded-lg bg-[#21262d] hover:bg-[#3 return;
    try {
      const res = await axios.get(`${BACKEND_URL}/api/user/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if(res.data && Array.isArray(res.data)) {
        setHistory(res.data);
        localStorage.setItem('searchHistory', JSON.stringify(res.data));
      }
    } catch (err) {}
  };

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
        } className="flex gap-2 ml-2">
              <span className="text-cyan-400 mt-1.5 w-1.5 h-1.5 bg-cyan-400 rounded-full flex-shrink-0" />
              <span>{line.replace(/[-•]/, '').trim()}</span>
            </div>
          );
        }
        // Empty lines
        if (line.trim() === '') return <div key={i} className="h-2" />;
        // Normal Paragraphs
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
};

function Discover() {
  const [mode, setMode] = useState("discover");
  const [moviesWithPosters, setMoviesWithPosters] = useState([]); 
  const [askResult, setAskResult] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState0363d] cursor-pointer transition-all border border-transparent hover:border-gray-600">
                <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-1">
                  {item.type === 'ask' ? <FiMessageSquare className="text-blue-400"/> : <FiFilm className="text-purple-400"/>} catch (err) {}
    }
  };

  const handleMoodChange = (mood) => {
    setSelectedMood(mood.name);
    setBgPoster(mood.bgPoster);
    setCurrentMood(mood);
  };

  useEffect(() => {
    const moodData = moods.find(m => m.name === selectedMood);
    if (moodData) {
      setBgPoster(moodData.bg("");
  
  // UI State
  const [selectedMood, setSelectedMood] = useState(moods[0].name);
  const [bgPoster, setBgPoster] = useState(moods[0].bgPoster);
  const [primaryColor, setPrimaryColor] = useState(moods[0].color);
  const [currentMood, setCurrentMood] = useState(moods[0]);
  const [history, set
                  <span>{item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}</span>Poster);
      setCurrentMood(moodData);
    }
  }, [selectedMood]);

  // ---History] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);

  // ---
                </div>
                <p className="text-xs text-gray-300 line-clamp-2 Load History on Mount ---
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetch MAIN SEARCH FUNCTION ---
  async function handleSearch(e, overrideInput = null) {
    if (e)">{item.query}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* MAINHistory = async () => {
    const local = localStorage.getItem('searchHistory');
    if (local) e.preventDefault();
    
    const query = overrideInput || input;
    let cleaned = query && typeof CONTENT */}
      <main className="flex-1 relative flex flex-col h-full w-full bg- setHistory(JSON.parse(local));

    const token = localStorage.getItem('token');
    if (!black">
        {!showSidebar && <button onClick={() => setShowSidebar(true)} className="absolute top-4 query === 'string' ? query.trim() : '';
    
    if (!cleaned) {
      setError("Please enter a prompt.");token) return;

    try {
      const res = await axios.get(`${BACKEND_URL}/api left-4 z-50 p-2 bg-black/50 backdrop-blur rounded-full text-
      return;
    }

    setError("");
    setAskResult("");
    setMoviesWithPosters/user/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      white hover:bg-white/10 transition-colors"><FiMenu /></button>}

        {/* Backgrounds */}
        ([]);
    setLoading(true);
    setInput(cleaned);
    
    saveToHistory(cleaned, mode);

if(res.data && Array.isArray(res.data)) {
        setHistory(res.data);<div className="absolute inset-0 w-full h-full z-0" style={{ backgroundImage: `url
        localStorage.setItem('searchHistory', JSON.stringify(res.data)); 
      }
    }(${bgPoster})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(8px    try {
      // ✅ SEND REQUEST WITH 'MODE'
      const res = await axios.post(`${BACKEND_URL}/ catch (err) { }
  };

  // --- Save History ---
  const saveToHistory = async (query, type)) brightness(0.4)', transition: 'background-image 1s ease-in-out' }} />api/gpt`, {
        messages: [{ role: "user", content: cleaned }],
        mode: mode
        <div className="absolute inset-0 w-full h-full z-0" style={{ background: => {
    const newItem = { query, type, timestamp: new Date() };
    const newHistory = `linear-gradient(135deg, ${currentMood.accentColor}20 0%, #0 [newItem, ...history].slice(0, 20);
    setHistory(newHistory);
     // Sends 'discover' or 'ask' to backend
      });

      const aiResponse = res.data.reply ||00000 90%)` }} />
        
        {/* ✅ STICKY HEADER (localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    const token = localStorage.getItem('token "";

      // --- HANDLE RESULTS BASED ON MODE ---
      if (mode === "ask") {
        // Mode');
    if (token) {
        try {
            await axios.post(`${BACKEND_URL}/Fixed at top) */}
        <div className="relative z-30 flex-shrink-0 w-full flex flex-col items-center pt-6 pb-2 px-4 md:px-10 bg-gradient-to-b from-black/95 via-black/80 to-transparent backdrop-blur-md border: Ask Expert (Text Response)
        setAskResult(aiResponse);
      } else {
        // Mode: Discover (Movie JSONapi/user/history`, 
                { query, type },
                { headers: { Authorization: `Bearer ${token}` } }
            -b border-white/5">
            {/* Moods */}
            <div className="flex gap-)
        let titles = [];
        try {
          const firstBracket = aiResponse.indexOf('[');
);
        } catch (err) { console.error("Failed to save history to DB"); }
    }          const lastBracket = aiResponse.lastIndexOf(']');
          
          if (firstBracket !== -1 && last3 py-2 px-1 max-w-full overflow-x-auto no-scrollbar mb-4">
                {moods.map((mood) => (
                <button key={mood.name} onClick={() => handleMoodChange(mood)} className={`rounded-full px-5 py-2 text-sm font-medium
  };

  const handleMoodChange = (mood) => {
    setSelectedMood(mood.name);
    setPrimaryColor(mood.color);
    setBgPoster(mood.bgPoster);
    setCurrentMood(mood);
    document.documentElement.style.setProperty('--primary-color', mood.color);
    Bracket !== -1) {
            const jsonStr = aiResponse.substring(firstBracket, lastBracket + 1);
            titles = JSON.parse(jsonStr);
          } else {
            throw new Error("Invalid JSON"); transition-all ${selectedMood === mood.name ? 'text-white scale-105 shadow-lg border
          }
        } catch (e) {
          // If JSON fails, fallback to showing text
          console.error("JSONdocument.documentElement.style.setProperty('--accent-color', mood.accentColor);
  };

  useEffect(() border-white/20' : 'text-gray-400 border border-transparent hover:bg- => {
    const moodData = moods.find(m => m.name === selectedMood);
    if Parse failed, switching to text mode");
          setMode("ask");
          setAskResult(aiResponse);white/5'}`} style={{ background: selectedMood === mood.name ? `linear-gradient(90deg, ${mood.color}, ${mood.accentColor})` : 'transparent' }}>
                    {mood.name}
                </button>
                ))}
            </div>
            {/* Search */}
            <div className="w-full max-w-3xl flex flex-col gap-0 shadow-2xl rounded-2xl overflow-hidden border border-white/20 relative z-40">
                <div className="flex w-full bg-[#161b22]/90 backdrop-blur-md">
                    <button className (moodData) {
      setBgPoster(moodData.bgPoster);
      setPrimaryColor(moodData.color);
      setCurrentMood(moodData);
    }
  }, [selectedMood]);

  // Main Search Function
  async function handleSearch(e, overrideInput = null) {
    if (e) e.preventDefault();
    
    const query = overrideInput || input;
    let cleaned = query &&
          setLoading(false);
          return;
        }

        // Fetch TMDB Data for Movies
        const results = await Promise.all(
          titles.map(async (item) => {
            try {
              let searchTitle = typeof item === 'string' ? item : item.title;
              searchTitle = searchTitle.replace(/\s*\(\d{4}\).*/, "").trim();

              const tmdbRes = await searchMovies(searchTitle);
              const={`flex-1 py-3 text-sm font-semibold tracking-wide transition-colors ${mode === "discover" ? "bg-white/10 text-white border-b-2 border-cyan-400 typeof query === 'string' ? query.trim() : '';
    
    if (!cleaned) {
      setError("Please enter a prompt.");
      return;
    }

    // Reset UI
    setError("");
    setAskResult("");
    setMoviesWithPosters([]);
    setLoading(true);
    setInput(cleaned);

    // Save to History
    saveToHistory(cleaned, mode);

    async function callLLM(messages, current best = tmdbRes.results?.[0];
              if (!best || !best.poster_path) return null;
              
              return {
                id: best.id,
                title: best.title,
                year: best.release_date?.slice(0, 4),
                posterUrl: " : "text-gray-500 hover:text-gray-300"}`} onClick={() => setMode("discover")}>Discover Movies</button>
                    <button className={`flex-1 py-3 textMode) {
      const body = { 
        messages, 
        // ✅ CRITICAL: Sending the mode`https://image.tmdb.org/t/p/w500${best.poster_path}`,
                rating: best.vote_average,
                curatorNote: item.reason || "" 
              };
            } catch { return null; }
          })
        );
        
        const filtered = results-sm font-semibold tracking-wide transition-colors ${mode === "ask" ? "bg-white/10 text-white border-b-2 border-pink-400" : "text-gray-500 hover:text-gray-300"}`} onClick={() => setMode("ask")}>Ask Expert</button>
                </div>
                <form className="flex w-full bg-black/60 backdrop- so backend knows what to return (JSON vs Text)
        mode: currentMode, 
        temperature: 0.7,
        model: "mistralai/mistral-7b-instruct",
        max_tokens: 1000
      };
      const res = await axios.post(`${BACKEND_URL}/api/gpt`, body);
      return res.data.reply || "";
    }

    try {
      // --- ASK MODE ---
      if (mode === "ask") {
        const messages = [{ role: "user", content: cleaned }];
        const aiText = await callLLM(messages, "ask");
        
        // Show text directly
        setAskResult(aiText);
      } 
      // --- DISCOVER MODE ---
      else {
        const moodPrompt = `The user's current mood is: ${selectedMood}.`;
        const messages = [
          { role: "user", content: `${cleaned}. ${moodPrompt}` }
        ];

        const aiText = await callLLM(messages, "discover");
        let titles = [];

        try {
          // Robust Parsing
          let cleanJson = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
          const firstBracket = cleanJson.indexOf('['.filter(Boolean);
        setMoviesWithPosters(filtered);
        if (filtered.length === 0) setError("No matching movies found.");
      }

    } catch (err) {
      console.error("Error:", err);
      setError("AI Service unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden font-sans text-white">
      
      {/* --- SIDEBAR --- */}
      <aside className={`flex-shrink-0 bg-[#0d1117] border-r border-[#30363d] flex flex-col transition-all duration-300 z-50 ${showSidebar ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0'} h-full fixed md:relative shadow-2xl`}>
        <div className="p-6 border-b border-[#30363d] flex items-center justify-between">
          <Link to="/" className="text-lg font-bold font-playfair text-white hover:text-cyan-400 transitionblur-xl p-2" onSubmit={(e) => handleSearch(e)}>
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder={mode === "discover" ? "Describe a vibe..." : "Ask a film question..."} className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-base md:text-lg px-4 py-3" disabled={loading} />
                    <button type="submit" className="px-6 md:px-8 py-2 rounded-xl text-white font-bold transition-all hover:scale-105 shadow-lg" style={{ background: `linear-gradient(135deg, ${currentMood.color}, ${currentMood.accentColor})` }} disabled={loading}>{loading ? "..." : "Search"}</button>
                </form>
            </div>
        </div>

        {/* SCROLLABLE RESULTS */}
        <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar w-full px-4 md:px-10 pb-10 pt-4">
            {error && <div className="mx-auto max-w-3xl px-6 py-3 bg-red-500/20 text-red-200 border border-red-500/50 rounded-lg text-sm text-center">{error}</div>}
            
            {loading && (
                <div className="flex flex);
          const lastBracket = cleanJson.lastIndexOf(']');
          
          if (firstBracket !== -1 && lastBracket !== -1) {
            cleanJson = cleanJson.substring(firstBracket, lastBracket + 1);
            titles = JSON.parse(cleanJson);
          } else {
             throw new Error("Invalid JSON structure");
          }
        } catch (e) {
          console.error("JSON Parse fail, falling back to Ask mode");
          setMode("ask");
          setAskResult(aiText);
          setLoading(false);
          return;
        }

        // Fetch TMDB Details
        const results = await Promise.all-colors">visual.cineaste</Link>
          <button onClick={() => setShowSidebar(false)} className="md:hidden text-gray-400"><FiX /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><FiClock /> Recent</h3>
          <div className="space-y-2">
            {history.map((item, idx) => (
              <div key={idx} onClick={() => { setMode(item.type || 'discover');-col items-center gap-4 mt-20 animate-pulse">
                    <div className="h-1 w-24 bg-white/20 rounded overflow-hidden"><div className="h-full bg-white animate-progress"></div></div>
                    <span className="text-white/50 text-sm font-light tracking-widest uppercase">Consulting the archives...</span>
                </div>
            )}

            {/* ✅ ASK RESULTS (Formatted Text) */}
            {mode === "ask" && askResult && !loading && (
                <div className="mx-auto p-8 rounded-2(
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
                posterUrl: `https://image.tmdb.org/t/p/w500${best.poster_ handleSearch(null, item.query); if(window.innerWidth < 768) setShowSidebar(false); }} className="p-3 rounded-lg bg-[#21262d] hover:bg-[#30363d] cursor-pointer transition-all border border-transparent hover:border-gray-600">
                <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-1">
                  {item.type === 'ask' ? <FiMessageSquare className="text-blue-400"/> : <FiFilm className="text-purple-400"/>}
                  <span>{item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}</span>
                </div>
                <p className="text-xs text-gray-300 line-clamp-2xl bg-[#161b22]/95 backdrop-blur-xl border border-gray-700/50 shadow-2xl max-w-4xl animate-fade-in">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/50">
                        <FiMessageSquare className="text-pink-400 text-xl" />
                        <h3 className="text-lg font-bold text-white tracking-wide">Expert Analysis</h3>
                    </div>
                    {/* Render text with line breaks preserved */}
                    <div className="text-gray-300 text-base leading-relaxed whitespace-pre-line font-light">
                        {askResult}
                    </div>
                </div>
            )}

            {/* ✅path}`,
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
      console.error">{item.query}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 relative flex flex-col h-full w-full bg-black">
        {!showSidebar && <button onClick={() => setShowSidebar(true)} className="absolute top-4 left-4 z-50 p-2 bg-black/50 backdrop-blur rounded-full text DISCOVER RESULTS (Movie Cards) */}
            {mode === "discover" && !loading && moviesWithPosters.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full max-w-7xl mx-auto mt-8 animate-fade-in">
                    {moviesWithPosters.map((movie, idx) => (
                        <Link key={idx} to={`/movie/${movie.id}`} className="group relative overflow-hidden rounded-xl bg-[#161b22] border border-gray-800 hover("Error:", err);
      setError("Connection to the Curator (AI) failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden font-sans text-white">
      
      {/* --- LEFT SIDEBAR: HISTORY --- */}
      <aside className={`flex-shrink-0 bg-white hover:bg-white/10 transition-colors"><FiMenu /></button>}

        {/* Backgrounds */}
        <div className="absolute inset-0 w-full h-full z-0" style={{ backgroundImage: `url(${bgPoster})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(8px) brightness(0.4)', transition: 'background-image 1s ease-in-out' }} />:border-cyan-500/50 hover:scale-105 transition-all duration-500 shadow-2xl flex flex-col h-full">
                            <div className="relative aspect-[2/3] overflow-hidden">
                                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                                <div className="absolute-[#0d1117] border-r border-[#30363d] flex flex-col transition-all duration-300 z-50 ${showSidebar ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0'} overflow-hidden h-full bottom-2 right-2 bg-yellow-500/90 text-black text-xs font-bold px-2 py-1 rounded shadow-lg">
                                    ★ {movie.rating?.toFixed(1)}
                                </div>
                            </div>
                            
                            <div className="p-4 flex flex-col gap-2 bg-[#161b22] flex-1">
                                <h3 className="text-white font-bold text-sm leading-tight">{movie.title} <span className="text-gray-5
        <div className="absolute inset-0 w-full h-full z-0" style={{ background: `linear-gradient(135deg, ${currentMood.accentColor}20 0%, #0 fixed md:relative shadow-2xl`}>
        <div className="p-6 border-b border-[#30363d] flex items-center justify-between">
          <Link to="/" className="text-lg font-bold font-playfair tracking-wide text-white hover:text-cyan-400 transition-colors">
            visual.cineaste
          </Link>
          <button onClick={() => setShowSidebar(false)} className="md:hidden text-gray-400">
            <FiX />
          </button>
        </div>00 font-normal">({movie.year})</span></h3>
                                
                                {/* Curator Note */}
                                {movie.curatorNote && (
                                    <div className="mt-auto pt-3 border-t border-gray-700/50">
                                        <p className="text-[11px] text-cyan-200 italic leading-relaxed">
                                            "{movie.curatorNote}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                00000 90%)` }} />
        
        {/* ✅ STICKY HEADER AREA */}
        <div className="relative z-30 flex-shrink-0 w-full flex flex-col items-center pt-6 pb-2 px-4 md:px-10 bg-gradient-to-b from-black/95 via-black/80 to-transparent backdrop-blur-md border-b border-white/5">
            {/* Moods */}
            <div className="flex gap-3 py-2 px-1 max-w-full overflow-x-auto no-scrollbar mb-4">
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
export default Discover;
