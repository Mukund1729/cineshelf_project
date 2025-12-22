import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { searchMovies } from "../api/tmdb";
import axios from 'axios';
import { FiClock, FiSearch, FiMessageSquare, FiFilm, FiMenu } from "react-icons/fi";

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
    const token = localStorage.getItem('token');
    if (!token) return; // Only fetch if logged in

    try {
      // NOTE: You need to create this route in backend or use a generic user update route
      // For now, if route doesn't exist, this might fail silently which is fine
      const res = await axios.get(`${BACKEND_URL}/api/user/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if(res.data && Array.isArray(res.data)) {
        setHistory(res.data);
      }
    } catch (err) {
      console.log("Could not load history from DB (Route might not exist yet)");
    }
  };

  // --- Save History ---
  const saveToHistory = async (query, type) => {
    const token = localStorage.getItem('token');
    
    // 1. Update UI immediately
    const newItem = { query, type, timestamp: new Date() };
    setHistory(prev => [newItem, ...prev].slice(0, 20));

    // 2. Save to DB if logged in
    if (token) {
        try {
            await axios.post(`${BACKEND_URL}/api/user/history`, 
                { query, type },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            console.error("Failed to save history to DB");
        }
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

    // Reset UI
    setError("");
    setAskResult("");
    setMoviesWithPosters([]);
    setLoading(true);
    setInput(cleaned); // Update input box if clicked from history

    // Save to History
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
      // --- ASK MODE ---
      if (mode === "ask") {
        const messages = [
          { role: "system", content: "You are a professional film critic and historian. Provide a detailed, concise, and professional answer." },
          { role: "user", content: cleaned }
        ];
        const aiText = await callLLM(messages);
        
        // Handle if AI returns JSON instead of text
        try {
            const parsed = JSON.parse(aiText);
            setAskResult(parsed.answer || parsed.reply || aiText);
        } catch {
            setAskResult(aiText);
        }
        
      } 
      // --- DISCOVER MODE ---
      else {
        const moodPrompt = `The user's current mood is: ${selectedMood}.`;
        const messages = [
          {
            role: "system",
            content: `You are a film curator. Return ONLY a raw JSON array of 6 movie objects based on the user request. 
            Format: [{"title": "Name", "year": "YYYY", "reason": "Short reason why"}]. 
            Do not add markdown formatting. ${moodPrompt}`
          },
          { role: "user", content: cleaned }
        ];

        const aiText = await callLLM(messages);
        let titles = [];

        try {
          // Robust Parsing: Remove markdown if present
          const cleanJson = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
          titles = JSON.parse(cleanJson);
        } catch (e) {
          console.error("JSON Parse fail, trying regex fallback");
          // Fallback if AI didn't return strict JSON
          setError("The Curator is thinking abstractly... please try a clearer prompt.");
          setLoading(false);
          return;
        }

        if (!Array.isArray(titles)) {
            // Handle if AI returned a single object answer instead of array
            if(titles.answer) {
                setMode("ask");
                setAskResult(titles.answer);
                setLoading(false);
                return;
            }
            titles = []; 
        }

        // Fetch TMDB Details in Parallel
        const results = await Promise.all(
          titles.map(async (item) => {
            try {
              let searchTitle = typeof item === 'string' ? item : item.title;
              // Clean title
              searchTitle = searchTitle.replace(/\s*\(\d{4}\).*/, "").trim();
              
              const tmdbRes = await searchMovies(searchTitle);
              const best = tmdbRes.results?.[0];
              
              if (!best || !best.poster_path) return null;
              
              return {
                id: best.id,
                title: best.title,
                year: best.release_date?.slice(0, 4),
                posterUrl: `https://image.tmdb.org/t/p/w500${best.poster_path}`,
                rating: best.vote_average,
                curatorNote: item.reason || "" // Add AI reason if available
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
      <aside className={`flex-shrink-0 bg-[#0d1117] border-r border-[#30363d] flex flex-col transition-all duration-300 z-50 ${showSidebar ? 'w-64' : 'w-0 opacity-0'} overflow-hidden`}>
        <div className="p-6 border-b border-[#30363d] flex items-center justify-between">
          <Link to="/" className="text-lg font-bold font-playfair tracking-wide text-white">
            visual.cineaste
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <FiClock /> Recent Discoveries
          </h3>

          <div className="space-y-2">
            {history.length === 0 && <p className="text-xs text-gray-600 italic">No search history.</p>}
            {history.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => handleSearch(null, item.query)}
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
      <main className="flex-1 relative flex flex-col h-full">
        
        {/* Toggle Sidebar Button */}
        <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="absolute top-4 left-4 z-50 p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-white/10 transition-colors"
        >
            <FiMenu />
        </button>

        {/* Dynamic Background (Scoped to Main Content) */}
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
        
        {/* Scrollable Content Area */}
        <div className="relative z-10 w-full h-full overflow-y-auto no-scrollbar flex flex-col items-center pt-20 pb-10 px-4 md:px-10">
            
            {/* Mood Chips */}
            <div className="flex gap-3 py-3 px-6 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 mb-12 max-w-full overflow-x-auto no-scrollbar">
                {moods.map((mood) => (
                <button
                    key={mood.name}
                    onClick={() => handleMoodChange(mood)}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    selectedMood === mood.name ? 'text-white scale-105 shadow-lg' : 'text-gray-400 hover:text-white'
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
            <div className="w-full max-w-3xl flex flex-col gap-0 shadow-2xl rounded-2xl overflow-hidden border border-white/20">
                {/* Mode Tabs */}
                <div className="flex w-full bg-black/60 backdrop-blur-md">
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
                <form className="flex w-full bg-black/40 backdrop-blur-xl p-2" onSubmit={(e) => handleSearch(e)}>
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={mode === "discover" ? "Describe a vibe: '80s neon noir with synth music'..." : "Ask: 'Why is The Godfather a masterpiece?'..."}
                        className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-lg px-4 py-3"
                        disabled={loading}
                    />
                    <button 
                        type="submit" 
                        className="px-8 py-2 rounded-xl text-white font-bold transition-all hover:scale-105 shadow-lg" 
                        style={{ background: `linear-gradient(135deg, ${currentMood.color}, ${currentMood.accentColor})` }}
                        disabled={loading}
                    >
                        {loading ? <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div> : "Search"}
                    </button>
                </form>
            </div>

            {/* Error Message */}
            {error && <div className="mt-6 px-6 py-3 bg-red-500/20 text-red-200 border border-red-500/50 rounded-lg text-sm backdrop-blur-md animate-fade-in">{error}</div>}

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
                <div className="mt-12 p-8 rounded-2xl bg-[#161b22]/90 backdrop-blur-xl text-white max-w-4xl text-lg shadow-2xl border border-white/10 leading-relaxed font-light animate-fade-in">
                    <div className="flex items-center gap-2 mb-4 text-cyan-400">
                        <FiMessageSquare />
                        <span className="text-xs font-bold uppercase tracking-wider">Expert Analysis</span>
                    </div>
                    {askResult}
                </div>
            )}

            {/* DISCOVER RESULTS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full max-w-7xl mt-12 pb-20">
            {moviesWithPosters.map((movie, idx) => (
                <Link 
                key={idx} 
                to={`/movie/${movie.id}`} 
                className="group relative overflow-hidden rounded-xl bg-[#161b22] border border-gray-800 hover:border-gray-500 hover:scale-105 transition-all duration-500 shadow-2xl flex flex-col"
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
                        <p className="text-[10px] text-cyan-200 italic leading-relaxed border-t border-gray-700 pt-2 mt-auto">
                            "{movie.curatorNote}"
                        </p>
                    )}
                </div>
                </Link>
            ))}
            </div>

            {/* Footer Quote */}
            <div className="mt-auto pt-10 text-white/20 text-xs italic font-serif tracking-widest uppercase text-center pb-6">
                “He remembers those vanished years…”
            </div>

        </div>
      </main>
    </div>
  );
}

export default Discover;
