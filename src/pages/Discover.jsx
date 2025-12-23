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
  { name: "Romantic", color: "#dc2626", bgPoster: romanticImg, accentColor: "#ef4444" },
  { name: "Melancholic", color: "#f472b6", bgPoster: melancholicImg, accentColor: "#f9a8d4" },
  { name: "Intense", color: "#6b7280", bgPoster: intenseImg, accentColor: "#9ca3af" },
  { name: "Feel-Good", color: "#3b82f6", bgPoster: feelGoodImg, accentColor: "#60a5fa" },
  { name: "Stylish", color: "#lc3Rpb25Xb3JrZmxvdw@@._V1_QL75_UX500_CR0,0,500,281_.webp';

// Backend URL
const BACKEND_URL = 'https://cineshelf-project.onrender.com';

// --- Mood Filter Data ---
const moods = [
  { name: "Romantic", color: "#dc2626", bgPoster: romanticImg, accentColor: "#ef4444" },
  { name: "Melancholic", color: "#f472b6", bgPoster: melancholicImg, accentColor: "#f9a8d4" },
  { name: "Intense", color: "#6b7280", bgPoster: intenseImg, accentColor: "#9ca3af" },
  { name: "Feel-Good", color: "#3b82f6", bgPoster: feelGoodImg, accentColor: "#60a5fa" },
  { name: "Stylish", color: "#f97316", bgPoster: stylishImg, accentColor: "#fb923c" }
];

// ✅ Helper Component for Professional Text Formatting
const FormatAIResponse = ({ text }) => {
  if (!text) return null;

  return (
    <div className="space-y-4 text-gray-300 leading-relaxed text-sm md:text-base font-light">
      {text.split('\n').map((line, index) => {
        // Handle Bullet Points
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          return (
            <div key={index} className="flex gap-3 ml-2 group">
              <span className="text-cyan-500 mt-1.5 w-1.5 h-1.5 bg-cyan-500 rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <p>
                {line.replace(/[-•]/, '').split('**').map((part, i) => 
                  i % 2 === 1 ? (
a5fa" },
  { name: "Stylish", color: "#f97316", bgPoster: stylishImg, accentColor: "#fb923c" }
];

// ✅ Helper Component: Professional Text Formatter
const FormatAIResponse = ({ text }) => {
  if (!text) return null;

  return (
    <div className="space-y-4 text-gray-300 leading-relaxed text-sm md:text-base font-light">
      {text.split('\n').map((line, index) => {
        // Handle Bullet Points
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          return (
            <div key={index} className="flex gap-3 ml-2 group">
              <span className="text-cyan-500 mt-1.5 w-1.5 h-1.5 bg-cyan-500 rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <p>
                {line.replace(/[-•]/, '').split('**').map((part, i) => 
                  i % 2 === 1 ? (
                    <span key={i} className="text-white font-bold tracking-wide border-b border-cyan-500/30">
                      {part}
                    </span>
                  ) : (
                    part
                  )
                )}
              </p>
            </div>
          );
        }

        // Handle Empty Lines
        if (line.trim() === '') return <div key={index} className="h-2" />;

        // Handle Normal Paragraphs with Bold Highlighting
        return (
          <p key={index}>
            {line.split('**').map((part, i) => 
              i % 2 === 1 ? (
                <span key={i} className="text-cyan-400 font-bold text-lg font-playfair tracking-wide text-shadow-sm
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
        } catch (err) { console.error("Failed to save history to DB"); }
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
      setBgPoster(moodData.bgPoster);
      setCurrentMood(moodData);
    }
  }, [selectedMood]);

  async function handleSearch(e, overrideInput = null) {
    if (e) e.preventDefault();
    const query = overrideInput || input;
    if (!query || !query.trim()) return;

    setError("");
    setAskResult("");
    setf97316", bgPoster: stylishImg, accentColor: "#fb923c" }
];

// --- Professional Text Formatter Component ---
const FormatAIResponse = ({ text }) => {
  if (!text) return null;

  return (
    <div className="space-y-4 text-gray-300 leading-relaxed text-sm md:text-base font-light">
      {text.split('\n').map((line, index) => {
        // 1. Handle Bullet Points
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          return (
            <div key={index} className="flex gap-3 ml-2 group">
              <span className="text-cyan-500 mt-2 w-1.5 h-1.5 bg-cyan-500 rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <p>
                {line.replace(/[-•]/, '').split('**').map((part, i) => 
                  i % 2 === 1 ? (
                    <span key={i} className="text-white font-bold tracking-wide border-b border-cyan-500/30">
                      {part}
                    </span>
                  ) : (
                    part
                  )
                )}
              </p>
            </div>
          );
        }

        // 2. Handle Empty Lines
        if (line.trim() === '') return <div key={index} className="h-2" />;

        // 3. Handle Normal Paragraphs with Bold Highlighting
        return (
          <p key={index}>
                    <span key={i} className="text-white font-bold tracking-wide border-b border-cyanMoviesWithPosters([]);
    setLoading(true);
    setInput(query);
    saveToHistory(            {line.split('**').map((part, i) => 
              i % 2 === 1 ? (
                <span key={i} className="text-cyan-400 font-bold text-lg font-playfair">
                  {part}
                </span>
              ) : (
                part
              )
            )}
          </p>
        );query, mode);

    async function callLLM(messages, currentMode) {
      const body = {-500/30">
                      {part}
                    </span>
                  ) : (
                    part tracking-wide text-shadow-sm">
                  {part}
                </span>
              ) : (
                part
              )
            )}
      })}
    </div>
  );
};

export default function Discover() {
  const [mode, 
        messages, 
        mode: currentMode, // ✅ Send mode to backend
        temperature: 
                  )
                )}
              </p>
            </div>
          );
        }

        // Handle
          </p>
        );
      })}
    </div>
  );
};

export default function Discover setMode] = useState("discover");
  const [moviesWithPosters, setMoviesWithPosters] = Empty Lines
        if (line.trim() === '') return <div key={index} className="h-2() {
  const [mode, setMode] = useState("discover");
  const [moviesWithPosters0.7,
        model: "mistralai/mistral-7b-instruct",
        max useState([]); 
  const [askResult, setAskResult] = useState("");
  const [input, setInput] = useState("");
" />;

        // Handle Normal Paragraphs with Bold Highlighting
        return (
          <p key={index_tokens: 1000
      };
      const res = await axios.post(`${BACKEND_, setMoviesWithPosters] = useState([]); 
  const [askResult, setAskResult] = useState("");
  const [input  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
URL}/api/gpt`, body);
      return res.data.reply || "";
    }

    try, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ {
      // --- ASK MODE ---
      if (mode === "ask") {
        const messages = [{  
  // UI State
  const [selectedMood, setSelectedMood] = useState(moods[0].}>
            {line.split('**').map((part, i) => 
              i % 2 === 1 ? (
                <span key={i} className="text-cyan-400 font-bold text-lg font-playfair tracking-wide text-shadow-sm">
                  {part}
                </span>
              ) : (
 role: "user", content: query }];
        const aiText = await callLLM(messages, "ask");
        setAskResult(aiText);
      } 
      // --- DISCOVER MODE ---
      else {
        error, setError] = useState("");
  
  // UI State
  const [selectedMood, setSelectedMood] = useState(moods[0].name);
  const [bgPoster, setBgPoster] = useState(name);
  const [bgPoster, setBgPoster] = useState(moods[0].bgPoster);
  const [currentMood, setCurrentMood] = useState(moods[0]);
  const [history, setHistory] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);

  //const moodPrompt = `The user's current mood is: ${selectedMood}.`;
        const messages = [ --- Load History on Mount ---
  useEffect(() => {
    fetchHistory();
  }, []);

  const                part
              )
            )}
          </p>
        );
      })}
    </div>
  moods[0].bgPoster);
  const [primaryColor, setPrimaryColor] = useState(moods[0].color););
};

export default function Discover() {
  const [mode, setMode] = useState("discover"); fetchHistory = async () => {
    // 1. LocalStorage (Fast)
    const local = localStorage.getItem
  const [currentMood, setCurrentMood] = useState(moods[0]);
  const [history,
            { role: "user", content: `${query}. ${moodPrompt}` }
        ];

        const('searchHistory');
    if (local) setHistory(JSON.parse(local));

    // 2
  const [moviesWithPosters, setMoviesWithPosters] = useState([]); 
  const [askResult setHistory] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);

  // aiText = await callLLM(messages, "discover");
        let titles = [];

        try {
. Database (Sync)
    const token = localStorage.getItem('token');
    if (!token) return;, setAskResult] = useState("");
  const [input, setInput] = useState("");
  const [ --- Load History on Mount ---
  useEffect(() => {
    fetchHistory();
  }, []);

  constloading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  
    try {
      const res = await axios.get(`${BACKEND_URL}/api/user/history`, {
        headers: {          // ✅ FIX: Clean Mistral Artifacts like [/INST]
          let cleanJson = aiText
            .replace(/```json/g fetchHistory = async () => {
    // 1. LocalStorage (Fast)
    const local = localStorage// UI State
  const [selectedMood, setSelectedMood] = useState(moods[0].name);
 Authorization: `Bearer ${token}` }
      });
      if(res.data && Array.isArray(res, "")
            .replace(/```/g, "")
            .replace(/\[\/?INST\]/g.getItem('searchHistory');
    if (local) setHistory(JSON.parse(local));

    //.data)) {
        setHistory(res.data);
        localStorage.setItem('searchHistory', JSON.  const [bgPoster, setBgPoster] = useState(moods[0].bgPoster);
  const, "") // Removes [INST] and [/INST]
            .replace(/\[\/?s\]/g, 2. Database (Sync)
    const token = localStorage.getItem('token');
    if (!token)stringify(res.data));
      }
    } catch (err) {}
  };

  const save [currentMood, setCurrentMood] = useState(moods[0]);
  const [history, setHistory] "")    // Removes [/s]
            .trim();

          const firstBracket = cleanJson.indexOf('['); return;
    try {
      const res = await axios.get(`${BACKEND_URL}/api/userToHistory = async (query, type) => {
    const newItem = { query, type, timestamp: new = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);

  // --- Load History
          const lastBracket = cleanJson.lastIndexOf(']');
          
          if (firstBracket !== -1 &&/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if( ---
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () Date() };
    const newHistory = [newItem, ...history].slice(0, 20);
 lastBracket !== -1) {
            cleanJson = cleanJson.substring(firstBracket, lastBracket + res.data && Array.isArray(res.data)) {
        setHistory(res.data);
            setHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

 => {
    // 1. LocalStorage
    const local = localStorage.getItem('searchHistory');
    localStorage.setItem('searchHistory', JSON.stringify(res.data));
      }
    } catch (errif (local) setHistory(JSON.parse(local));

    // 2. Database
    const token    const token = localStorage.getItem('token');
    if (token) {
        try {
            await1);
            titles = JSON.parse(cleanJson);
          } else {
             // If JSON fails, check) {}
  };

  const saveToHistory = async (query, type) => {
    const newItem = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = = { query, type, timestamp: new Date() };
    const newHistory = [newItem, ...history]. await axios.get(`${BACKEND_URL}/api/user/history`, {
        headers: { Authorization: if it's a single answer
             throw new Error("Invalid JSON structure");
          }
        } catch (eslice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('searchHistory `Bearer ${token}` }
      });
      if(res.data && Array.isArray(res.data) {
          console.error("JSON Parse fail, falling back to Ask mode");
          setMode("ask', JSON.stringify(newHistory));

    const token = localStorage.getItem('token');
    if (token)) {
        setHistory(res.data);
        localStorage.setItem('searchHistory', JSON.stringify( axios.post(`${BACKEND_URL}/api/user/history`, 
                { query, type },
res.data));
      }
    } catch (err) {}
  };

  const saveToHistory                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err)) {
        try {
            await axios.post(`${BACKEND_URL}/api/user/history`, = async (query, type) => {
    const newItem = { query, type, timestamp: new Date() 
                { query, type },
                { headers: { Authorization: `Bearer ${token}` } }
");
          setAskResult(aiText);
          setLoading(false);
          return;
        }            );
        } catch (err) { console.error("Failed to save history to DB"); }
     { console.error("Failed to save history to DB"); }
    }
  };

  const handleMood

        const results = await Promise.all(
          titles.map(async (item) => {
             };
    const newHistory = [newItem, ...history].slice(0, 20);
    set}
  };

  const handleMoodChange = (mood) => {
    setSelectedMood(mood.nameChange = (mood) => {
    setSelectedMood(mood.name);
    setBgPoster(mood.History(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    const);
    setBgPoster(mood.bgPoster);
    setCurrentMood(mood);
  };

  bgPoster);
    setCurrentMood(mood);
  };

  useEffect(() => {
    const moodDatatry {
              let searchTitle = typeof item === 'string' ? item : item.title;
              search token = localStorage.getItem('token');
    if (token) {
        try {
            await axios.useEffect(() => {
    const moodData = moods.find(m => m.name === selectedMood);
Title = searchTitle.replace(/\s*\(\d{4}\).*/, "").trim();
              const tm = moods.find(m => m.name === selectedMood);
    if (moodData) {
      post(`${BACKEND_URL}/api/user/history`, 
                { query, type },
                {    if (moodData) {
      setBgPoster(moodData.bgPoster);
      setCurrentMood(setBgPoster(moodData.bgPoster);
      setCurrentMood(moodData);
    }
  },dbRes = await searchMovies(searchTitle);
              const best = tmdbRes.results?.[0]; headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) { consolemoodData);
    }
  }, [selectedMood]);

  async function handleSearch(e, overrideInput.error("Failed to save history to DB"); }
    }
  };

  const handleMoodChange = = null) {
    if (e) e.preventDefault();
    const query = overrideInput || input;
              if (!best || !best.poster_path) return null;
              return {
                id: [selectedMood]);

  async function handleSearch(e, overrideInput = null) {
    if (e best.id,
                title: best.title,
                year: best.release_date?.slice( (mood) => {
    setSelectedMood(mood.name);
    setBgPoster(mood.bgPoster
    if (!query || !query.trim()) return;

    setError("");
    setAskResult("");
) e.preventDefault();
    const query = overrideInput || input;
    if (!query || !query.0, 4),
                posterUrl: `https://image.tmdb.org/t/p/    setMoviesWithPosters([]);
    setLoading(true);
    setInput(query);
    saveTow500${best.poster_path}`,
                backdrop_path: best.backdrop_path,
);
    setCurrentMood(mood);
  };

  useEffect(() => {
    const moodData = moods.find(m => m.name === selectedMood);
    if (moodData) {
      setBgtrim()) return;

    setError("");
    setAskResult("");
    setMoviesWithPosters([]);
    History(query, mode);

    async function callLLM(messages, currentMode) {
      const bodysetLoading(true);
    setInput(query);
    saveToHistory(query, mode);

    async                rating: best.vote_average,
                overview: best.overview,
                curatorNote: item = { 
        messages, 
        mode: currentMode, // ✅ Send mode to backend
        temperaturePoster(moodData.bgPoster);
      setCurrentMood(moodData);
    }
  }, [selected.reason || "" 
              };
            } catch { return null; }
          })
        );

 function callLLM(messages, currentMode) {
      const body = { 
        messages, 
Mood]);

  async function handleSearch(e, overrideInput = null) {
    if (e) e: 0.7,
        model: "mistralai/mistral-7b-instruct",
        mode: currentMode, // ✅ Send mode to backend
        temperature: 0.7,
        model.preventDefault();
    const query = overrideInput || input;
    let cleaned = query && typeof query === ': "mistralai/mistral-7b-instruct",
        max_tokens: 100string' ? query.trim() : '';
    if (!cleaned) { setError("Please enter a prompt."); return        max_tokens: 1000
      };
      const res = await axios.post(`${BACK0
      };
      const res = await axios.post(`${BACKEND_URL}/api/gpt`, body; }

    setError("");
    setAskResult("");
    setMoviesWithPosters([]);
    setLoadingEND_URL}/api/gpt`, body);
      return res.data.reply || "";
    }

);
      return res.data.reply || "";
    }

    try {
      // --- ASK MODE(true);
    setInput(cleaned);
    saveToHistory(cleaned, mode);

    async function call        const filtered = results.filter(Boolean);
        setMoviesWithPosters(filtered);
        if (filtered.length === 0) setError("No matching movies found in our archives.");
      }
    } catch    try {
      // --- ASK MODE ---
      if (mode === "ask") {
        const messagesLLM(messages, currentMode) {
      const body = { 
        messages, 
        mode (err) {
      console.error("Error:", err);
      setError("Connection to the Curator (AI = [{ role: "user", content: query }];
        const aiText = await callLLM(messages, ---
      if (mode === "ask") {
        const messages = [{ role: "user", content:) failed. Please try again.");
    } finally {
      setLoading(false);
    }
  : currentMode,
        temperature: 0.7,
        model: "mistralai/mistral "ask");
        setAskResult(aiText);
      } 
      // --- DISCOVER MODE ---
      else {
        -7b-instruct",
        max_tokens: 1000
      };
      const res query }];
        const aiText = await callLLM(messages, "ask");
        setAskResult(const moodPrompt = `The user's current mood is: ${selectedMood}.`;
        const messages = [ = await axios.post(`${BACKEND_URL}/api/gpt`, body);
      return res.data.aiText);
      } 
      // --- DISCOVER MODE ---
      else {
        const moodPrompt
            { role: "user", content: `${query}. ${moodPrompt}` }
        ];

        const = `The user's current mood is: ${selectedMood}.`;
        const messages = [
            {}

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden font-sans text-white">
      
      {/* SIDEBAR */}
      <aside className={`flex-shrink-0 bg-[#0d1117] border-r border-[#30363d] flex flex-col transition-all duration-300 z-50 ${showSidebar ? 'w-6 role: "user", content: `${query}. ${moodPrompt}` }
        ];

        const aiText =reply || "";
    }

    try {
      // --- ASK MODE ---
      if (mode === " aiText = await callLLM(messages, "discover");
        let titles = [];

        try {
ask") {
        const messages = [{ role: "user", content: cleaned }];
        const aiText = await callLLM(messages, "discover");
        let titles = [];

        try {
          // Robust4 translate-x-0' : 'w-0 -translate-x-full opacity-0'} h- Parsing
          let cleanJson = aiText
            .replace(/```json/g, "")
            .replace          // ✅ FIX: Clean Mistral Artifacts like [/INST]
          let cleanJson = aiText
            .replace(/```json/g await callLLM(messages, "ask");
        
        // Handle if AI returns JSON instead of text
        try {
            full fixed md:relative shadow-2xl`}>
        <div className="p-6 border-b borderconst cleanText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();, "")
            .replace(/```/g, "")
            .replace(/\[\/?INST\]/g(/```/g, "")
            .replace(/\[\/?INST\]/g, "") // Fix Mistral artifacts
            .replace(/, "")
            .replace(/\[\/?s\]/g, "")
            .trim();

          const\[\/?s\]/g, "")
            .trim();
          
          const firstBracket = cleanJson
            if (cleanText.startsWith('{')) {
                const parsed = JSON.parse(cleanText);
                setAskResult(parsed.answer || parsed.reply || aiText);
            } else {
                set firstBracket = cleanJson.indexOf('[');
          const lastBracket = cleanJson.lastIndexOf(']');
          
.indexOf('[');
          const lastBracket = cleanJson.lastIndexOf(']');
          
          if (firstBracketAskResult(aiText);
            }
        } catch {
            setAskResult(aiText);
          if (firstBracket !== -1 && lastBracket !== -1) {
            cleanJson = cleanJson. !== -1 && lastBracket !== -1) {
            cleanJson = cleanJson.substring(firstBracket,        }
        
      } 
      // --- DISCOVER MODE ---
      else {
        const moodPrompt = `The lastBracket + 1);
            titles = JSON.parse(cleanJson);
          } else {
             -[#30363d] flex items-center justify-between">
          <Link to="/" className=" user's current mood is: ${selectedMood}.`;
        const messages = [
            { role: "user", content: `${cleaned}. ${moodPrompt}` }
        ];

        const aiText = await callLLM(messages, "discover");
        let titles = [];

        try {
          // ✅ FIX: Cleanthrow new Error("Invalid JSON structure");
          }
        } catch (e) {
          console.error("JSON Parse fail, falling back to Ask mode");
          setMode("ask");
          setAskResult(aiText);
          setLoading(false);
          return;
        }

        const results = await Promise.all(
          titles.map(async (item) => {
            try {
              let searchTitlesubstring(firstBracket, lastBracket + 1);
            titles = JSON.parse(cleanJson);
          } else {
             throw new Error("Invalid JSON structure");
          }
        } catch (e) {
          console.error("JSON Parse fail, falling back to Ask mode");
          setMode("ask");
text-lg font-bold font-playfair text-white hover:text-cyan-400 transition-colors">visual.cineaste</Link>
          <button onClick={() => setShowSidebar(false)} className="md:hidden text-gray-400"><FiX /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><FiClock /> Recent</h3>
          <div className="space-y-2">
            {history.map((item, idx) => (
              <div key={idx} onClick={() => { setMode(item.type || 'discover'); handleSearch(null, item.query); if(window.innerWidth < 768) setShowSidebar(false); }} className="p-3 rounded-lg bg-[#21262d] hover:bg-[#30363d] cursor-pointer transition-all border border-transparent hover: Mistral Artifacts like [/INST] to prevent errors
          let cleanJson = aiText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .replace(/\[\/?INST\]/g, "") // Removes [INST] and [/INST]
            .replace(/\[\/?s\]/g, "")    // Removes [/s]
            .trim();

          // Find the actual JSON array
          const firstBracket = cleanJson.indexOf('[');
          const lastBracket = cleanJson.lastIndexOf(']');
          
          if (firstBracket !== -1 && lastBracket !== -1) {
            cleanJson = cleanJson.substring(firstBracket, lastBracket + 1);
            titles = JSON.parse(cleanJson);
          } else {
            // Check if it's a single answer object
            const firstCurly = cleanJson.indexOf('{');
            const lastCurly = cleanJson.lastIndexOf('}');
            if (firstCurly !== -1 = typeof item === 'string' ? item : item.title;
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

        const filtered = results.filter          setAskResult(aiText);
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
                ratingborder-gray-600">
                <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-1">
                  {item.type === 'ask' ? <FiMessageSquare className="text-blue-400"/> : <FiFilm className="text-purple-400"/>}
                  <span>{item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}</span>
                </div>
                <p className="text-xs text-gray-300 line-clamp-2">{item.query}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 relative flex flex-col h-full w-full bg-black">
        {!showSidebar && <button onClick={() => && lastCurly !== -1) {
               const jsonObj = JSON.parse(cleanJson.substring(firstCurly, lastCurly + 1));
               if (jsonObj.answer) {
                   setMode("ask");
                   setAskResult(jsonObj.answer);
                   setLoading(false);
                   return;
               (Boolean);
        setMoviesWithPosters(filtered);
        if (filtered.length === 0) setError("No matching movies found in our archives.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Connection to the Curator (AI) failed. Please try again.");: best.vote_average,
                overview: best.overview,
                curatorNote: item.reason || "" 
              };
            } catch { return null; }
          })
        );

        const filtered = results.filter(Boolean);
        setMoviesWithPosters(filtered);
        if (filtered. setShowSidebar(true)} className="absolute top-4 left-4 z-50 p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-white/10 transition-colors"><}
            }
            throw new Error("Invalid JSON structure");
          }
        } catch (e) {
          console.error("JSON Parse fail, falling back to Ask mode");
          setMode("ask");
          setAskResult(aiText);
          setLoading(false);
          return;
        }


    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden font-sans text-white">
      
      {/* SIDEBAR */}
      <aside className={`flex-shrink-0 bg-[#0dlength === 0) setError("No matching movies found in our archives.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Connection to the Curator (AI) failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

FiMenu /></button>}

        {/* Backgrounds */}
        <div className="absolute inset-0 w-full h-full z-0" style={{ backgroundImage: `url(${bgPoster})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(8px) brightness(0.4)', transition: '1117] border-r border-[#30363d] flex flex-col transition-all        const results = await Promise.all(
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
                year: best.release_date?.slice(0background-image 1s ease-in-out' }} />
        <div className="absolute inset-0 w-full h-full z-0" style={{ background: `linear-gradient(135deg, ${currentMood.accentColor}20 0%, #000000 90%)` }} />
        
        {/* ✅ STICKY HEADER */}
        <div className="relative z-30 flex-shrink-0 w-full flex flex-col items-center pt-6 pb-2 px-4 md:px-10 bg-gradient-to-b from-black/95 via-black/80 to-transparent backdrop-blur-md border-b border-white/5">
            {/* Mood  return (
    <div className="flex h-screen w-full bg-black overflow-hidden font-sans text-white">
      
      {/* SIDEBAR */}
      <aside className={`flex-shrink-0 bg-[#0d1117] border-r border-[#30363d] flex flex-col transition-all duration duration-300 z-50 ${showSidebar ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0'} h-full fixed md:relative shadow-2xl`}>
        <div className="p-6 border-b border-[#30363d] flex items-center justify-between">
          <Link to="/" className="text-lg font-bold font-playfair text-white hover:text-cyan-400 transition-colors">visual.cineaste</, 4),
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
        if (filtereds */}
            <div className="flex gap-3 py-2 px-1 max-w-full overflow-x-auto no-scrollbar mb-4">
                {moods.map((mood) => (
                <button key={mood.name} onClick={() => handleMoodChange(mood)} className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${selectedMood === mood.name ? 'text-white scale-105 shadow-lg border border-white/20' : 'text-gray-400 border border-transparent hover:bg-white/5'}`} style={{ background: selectedMood === mood-300 z-50 ${showSidebar ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0'} h-full fixed md:relative shadow-2xl`}>
        <div className="p-6 border-b border-[#30363d] flex items-center justify-between">
          <Link to="/" className="text-lg font-bold font-playfair text-white hover:text-cyan-400 transition-colors">visual.cineaste</Link>
          <button onClick={() => setShowSidebar(false)} className="md:hidden text-gray-400"><FiX /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <h3 className="text-xs font-semibold text-gray-Link>
          <button onClick={() => setShowSidebar(false)} className="md:hidden text-gray-400"><FiX /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><FiClock /> Recent</h3>
          <div className="space-y-2">
            {history.map((item, idx) => (
              <div key={idx} onClick={() => { setMode(item.type || 'discover'); handle.length === 0) setError("No matching movies found in our archives.");
      }
    } catch (500 uppercase tracking-wider mb-4 flex items-center gap-2"><FiClock /> Recent</h3>
Search(null, item.query); if(window.innerWidth < 768) setShowSidebar(false);.name ? `linear-gradient(90deg, ${mood.color}, ${mood.accentColor})` : 'transparent' }}>
                    {mood.name}
                </button>
                ))}
            </div>
            {/* Search */}
            <div className="w-full max-w-3xl flex flex-colerr) {
      console.error("Error:", err);
      setError("Connection to the Curator (AI) failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }          <div className="space-y-2">
            {history.map((item, idx) => (
              <div key={idx} onClick={() => { setMode(item.type || 'discover'); handleSearch(null, item.query); if(window.innerWidth < 768) setShowSidebar(false); }} }} className="p-3 rounded-lg bg-[#21262d] hover:bg-[#30363d] cursor-pointer transition-all border border-transparent hover:border-gray-600">
                <div className="flex items-center gap-2 text-[10px] text-gray- gap-0 shadow-2xl rounded-2xl overflow-hidden border border-white/20 relative z-

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden font className="p-3 rounded-lg bg-[#21262d] hover:bg-[#303400 mb-1">
                  {item.type === 'ask' ? <FiMessageSquare className="40">
                <div className="flex w-full bg-[#161b22]/90text-blue-400"/> : <FiFilm className="text-purple-400"/>}
-sans text-white">
      
      {/* SIDEBAR */}
      <aside className={`flex-shrink-0 bg-[#0d163d] cursor-pointer transition-all border border-transparent hover:border-gray-600"> backdrop-blur-md">
                    <button className={`flex-1 py-3 text-sm font-semibold117] border-r border-[#30363d] flex flex-col transition-all duration                  <span>{item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}</span>

                <div className="flex items-center gap-2 text-[10px] text-gray-4-300 z-50 ${showSidebar ? 'w-64 translate-x-0' : tracking-wide transition-colors ${mode === "discover" ? "bg-white/10 text-white"                </div>
                <p className="text-xs text-gray-300 line-clamp-2">{00 mb-1">
                  {item.type === 'ask' ? <FiMessageSquare className="text 'w-0 -translate-x-full opacity-0'} h-full fixed md:relative shadow-2 : "text-gray-500 hover:text-gray-300"}`} onClick={() => setitem.query}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>

-blue-400"/> : <FiFilm className="text-purple-400"/>}
                  Mode("discover")}>Discover Movies</button>
                    <button className={`flex-1 py-3 text-      {/* MAIN CONTENT */}
      <main className="flex-1 relative flex flex-col h-full wxl`}>
        <div className="p-6 border-b border-[#30363d]<span>{item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}</span>
                -full bg-black">
        {!showSidebar && <button onClick={() => setShowSidebar(true)} className="sm font-semibold tracking-wide transition-colors ${mode === "ask" ? "bg-white/10 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold font-</div>
                <p className="text-xs text-gray-300 line-clamp-2">{itemplayfair text-white hover:text-cyan-400 transition-colors">visual.cineaste</Link text-white" : "text-gray-500 hover:text-gray-300"}`}.query}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>

       onClick={() => setMode("ask")}>Ask Expert</button>
                </div>
                <form className="flexabsolute top-4 left-4 z-50 p-2 bg-black/50 backdrop-blur rounded{/* MAIN CONTENT */}
      <main className="flex-1 relative flex flex-col h-full w- w-full bg-black/60 backdrop-blur-xl p-2" onSubmit={(e) => handle-full text-white hover:bg-white/10 transition-colors"><FiMenu /></button>}

        Search(e)}>
                    <input type="text" value={input} onChange={e => setInput(e{/* Backgrounds */}
        <div className="absolute inset-0 w-full h-full z-0full bg-black">
        {!showSidebar && <button onClick={() => setShowSidebar(true)} className="absolute>
          <button onClick={() => setShowSidebar(false)} className="md:hidden text-gray-40" style={{ backgroundImage: `url(${bgPoster})`, backgroundSize: 'cover', backgroundPosition: 'center',.target.value)} placeholder={mode === "discover" ? "Describe a vibe..." : "Ask a film question top-4 left-4 z-50 p-2 bg-black/50 backdrop-blur rounded-0"><FiX /></button>
        </div>
        <div className="flex-1 overflow-y-auto..."} className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text p-4 custom-scrollbar">
          <h3 className="text-xs font-semibold text-gray- filter: 'blur(8px) brightness(0.4)', transition: 'background-image 1s easefull text-white hover:bg-white/10 transition-colors"><FiMenu /></button>}

        {-base md:text-lg px-4 py-3" disabled={loading} />
                    <button type500 uppercase tracking-wider mb-4 flex items-center gap-2"><FiClock /> Recent</h3>
-in-out' }} />
        <div className="absolute inset-0 w-full h-full z/* Backgrounds */}
        <div className="absolute inset-0 w-full h-full z-0"="submit" className="px-6 md:px-8 py-2 rounded-xl text-white font--0" style={{ background: `linear-gradient(135deg, ${currentMood.accentColor}          <div className="space-y-2">
            {history.map((item, idx) => (bold transition-all hover:scale-105 shadow-lg" style={{ background: `linear-gradient( style={{ backgroundImage: `url(${bgPoster})`, backgroundSize: 'cover', backgroundPosition: 'center', filter20 0%, #000000 90%)` }} />
        
        {
              <div key={idx} onClick={() => { setMode(item.type || 'discover'); handleSearch135deg, ${currentMood.color}, ${currentMood.accentColor})` }} disabled={loading}>{loading ? "..." : "Search"}</button>
                </form>
            </div>
        </div>

        (null, item.query); if(window.innerWidth < 768) setShowSidebar(false); }}/* STICKY HEADER */}
        <div className="relative z-30 flex-shrink-0 w-full flex flex-col items className="p-3 rounded-lg bg-[#21262d] hover:bg-[#303-center pt-6 pb-2 px-4 md:px-10 bg-gradient-to-b from-black/95 via-black/80 to-transparent backdrop-blur-md border-b border-white/5">
            {/* Moods */}
            <div className="flex gap-3 py-2 px-1 max-w-full overflow-x-auto no-scrollbar mb-4">
                {moods.map((mood) => (
                <button key={mood.name} onClick={() => handleMoodChange(mood)} className={`rounded-full px-5 py-2 text-sm font-medium transition-all{/* ✅ SCROLLABLE RESULTS */}
        <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar w-full px-4 md:px-10 pb-10 pt-4">
            {error && <div className="mx-auto max-w-3xl px-6 py-3 bg-red-500/20 text-red-200 border border-red-500/50 rounded-lg text-sm text-center">{error}</div>}
            
            {loading && (
                <div className="flex flex-col items-center gap-4 mt-20 animate-pulse: 'blur(8px) brightness(0.4)', transition: 'background-image 1s ease-in-out' }} />
        <div className="absolute inset-0 w-full h-full z-0" style={{ background: `linear-gradient(135deg, ${currentMood.accentColor}20 0%, #000000 90%)` }} />
        
        {/* ✅ STICKY HEADER (Fixed at top) */}
        <div className="relative z-30 flex-shrink-0 w-full flex flex-col items-center pt-6 pb-2 px-4 md:px-10 bg-gradient-to-b from-black/95 via-black/80 to-63d] cursor-pointer transition-all border border-transparent hover:border-gray-600">
                <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-1">
                  {item.type === 'ask' ? <FiMessageSquare className="text-blue-400"/> : <FiFilm className="text-purple-400"/>}
                  <span>{item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}</span>
                 ${selectedMood === mood.name ? 'text-white scale-105 shadow-lg border border-white/20' : 'text-gray-400 border border-transparent hover:bg-white/5'}`} style={{ background: selectedMood === mood.name ? `linear-gradient(90deg, ${mood.color}, ${mood.accentColor})` : 'transparent' }}>
                    {mood.name}
                </button>
                ))}
            </div>
            {/* Search */}
            <div className="w-full">
                    <div className="h-1 w-24 bg-white/20 rounded overflow-hidden"><div className="h-full bg-white animate-progress"></div></div>
                    <span className="text-white/50 text-sm font-light tracking-widest uppercase">Consulting the archives...</span>
                </div>
            )}

            {/* ✅ ASK RESULTS (Formatted with Helper Component) */}
            {mode === "ask" && askResult && !loading && (
                <div className="mx-auto p-8 rounded-2xl bg-[#16transparent backdrop-blur-md border-b border-white/5">
            {/* Moods */}
            <div className="flex gap-3 py-2 px-1 max-w-full overflow-x-auto no-scrollbar mb-4">
                {moods.map((mood) => (
                <button key={mood.name} onClick={() => handleMoodChange(mood)} className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${selectedMood === mood.name ? 'text-white scale-</div>
                <p className="text-xs text-gray-300 line-clamp-2">{item.query}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 relative flex flex-col h-full w-full bg-black">
        {!showSidebar && <button onClick={() => setShowSidebar(true)} className="absolute105 shadow-lg border border-white/20' : 'text-gray-400 border top-4 left-4 z-50 p-2 bg-black/50 backdrop-blur rounded-1b22]/95 backdrop-blur-xl border border-gray-700/50 shadowfull text-white hover:bg-white/10 transition-colors"><FiMenu /></button>}

        { border-transparent hover:bg-white/5'}`} style={{ background: selectedMood === mood.name ? -2xl max-w-4xl animate-fade-in">
                    <div className="flex items- max-w-3xl flex flex-col gap-0 shadow-2xl rounded-2xl overflow-hidden/* Backgrounds */}
        <div className="absolute inset-0 w-full h-full z-0"`linear-gradient(90deg, ${mood.color}, ${mood.accentColor})` : 'transparent' border border-white/20 relative z-40">
                <div className="flex w-full bgcenter gap-3 mb-6 pb-4 border-b border-gray-700/50"> style={{ backgroundImage: `url(${bgPoster})`, backgroundSize: 'cover', backgroundPosition: 'center', filter
                        <div className="p-2 bg-gradient-to-br from-pink-500/-[#161b22]/90 backdrop-blur-md">
                    <button className={`flex-: 'blur(8px) brightness(0.4)', transition: 'background-image 1s ease-20 to-purple-500/20 rounded-lg">
                            <FiMessageSquare className="1 py-3 text-sm font-semibold tracking-wide transition-colors ${mode === "discover" ? " }}>
                    {mood.name}
                </button>
                ))}
            </div>
            {/* Searchin-out' }} />
        <div className="absolute inset-0 w-full h-full z-text-pink-400 text-xl" />
                        </div>
                        <div>
                            <h3 classNamebg-white/10 text-white" : "text-gray-500 hover:text-gray */}
            <div className="w-full max-w-3xl flex flex-col gap-0 shadow0" style={{ background: `linear-gradient(135deg, ${currentMood.accentColor}2="text-lg font-bold text-white tracking-wide font-playfair">Expert Analysis</h3>
                            <-300"}`} onClick={() => setMode("discover")}>Discover Movies</button>
                    <button0 0%, #000000 90%)` }} />
        
        {/*p className="text-[10px] text-cyan-400 uppercase tracking-widest font-semibold-2xl rounded-2xl overflow-hidden border border-white/20 relative z-40">
                <div className="flex w className={`flex-1 py-3 text-sm font-semibold tracking-wide transition-colors ${mode === " ✅ STICKY HEADER AREA */}
        <div className="relative z-30 flex-shrink-0 w-full bg-[#161b22]/90 backdrop-blur-md">
                    <button className">CineSage AI</p>
                        </div>
                    </div>
                    {/* Using the Professional Formatter */}
                    <FormatAIask" ? "bg-white/10 text-white" : "text-gray-500 hover-full flex flex-col items-center pt-6 pb-2 px-4 md:px-10={`flex-1 py-3 text-sm font-semibold tracking-wide transition-colors ${mode === "discover:text-gray-300"}`} onClick={() => setMode("ask")}>Ask Expert</button> bg-gradient-to-b from-black/95 via-black/80 to-transparent backdrop-Response text={askResult} />
                </div>
            )}

            {/* DISCOVER RESULTS */}
            {" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-3mode === "discover" && !loading && moviesWithPosters.length > 0 && (
                <divblur-md border-b border-white/5">
            {/* Moods */}
            <div className00"}`} onClick={() => setMode("discover")}>Discover Movies</button>
                    <button className={ className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:="flex gap-3 py-2 px-1 max-w-full overflow-x-auto no-scrollbar
                </div>
                <form className="flex w-full bg-black/60 backdrop-blur-xl`flex-1 py-3 text-sm font-semibold tracking-wide transition-colors ${mode === "ask" mb-4">
                {moods.map((mood) => (
                <button key={mood.grid-cols-5 gap-6 w-full max-w-7xl mx-auto mt-8 animate p-2" onSubmit={(e) => handleSearch(e)}>
                    <input type="text" value={ ? "bg-white/10 text-white" : "text-gray-500 hover:text-fade-in">
                    {moviesWithPosters.map((movie, idx) => (
                        <name} onClick={() => handleMoodChange(mood)} className={`rounded-full px-5 py-2 text-sm font-medium transition-all-gray-300"}`} onClick={() => setMode("ask")}>Ask Expert</button>
                Link key={idx} to={`/movie/${movie.id}`} className="group relative overflow-hidden rounded-xl ${selectedMood === mood.name ? 'text-white scale-105 shadow-lg border border-whiteinput} onChange={e => setInput(e.target.value)} placeholder={mode === "discover" ? "Describe a vibe..." : "Ask a film question..."} className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-base md:text-lg px-4 py-3" disabled={loading} />
                    <button type="submit" className="px-6 md:px-8 py-2 rounded-xl text-white font-bold transition-all hover:scale-105 shadow-lg" style={{ background: `linear-gradient(135deg, ${currentMood.color}, ${currentMood.accentColor})` }} disabled={loading}>{loading ? "..." : "Search"}</button>
                </form>
            </div>
        </div>

        {/* SCROLLABLE RESULTS */}
        <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar w-full px-4 md:px-10 pb-10 pt-4">
            {error && <div className="mx-auto max bg-[#161b22] border border-gray-800 hover:border-cyan-500/50 hover:scale-105 transition-all duration-500 shadow-2xl flex flex-col h-full">
                            <div className="relative aspect-[2/3] overflow-hidden">
                                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                                <div className="absolute bottom-2 right-2 bg-yellow-500/90 text-black text-xs font-bold px-2 py-1 rounded shadow-lg">
                                    ★ {movie.rating?.toFixed(1)}
                                </div>
                            </div>
                            <div className="p-4 flex flex-col gap-2 bg-[#</div>
                <form className="flex w-full bg-black/60 backdrop-blur-xl p-2" onSubmit={(e) => handleSearch(e)}>
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder={mode === "discover" ? "Describe a vibe..." : "Ask a film question..."} className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-base md:text-lg px-4 py-3" disabled={loading} />
                    <button type="submit" className="px-6 md:px-8 py-2 rounded-xl text-white font-bold transition-all hover:scale-105 shadow-lg" style={{ background: `linear-gradient(135deg, ${currentMood.color}, ${currentMood.accentColor})` }} disabled={loading}>{loading ? "..." : "Search"}</button>
                </form>
            </div>
        </div>

        {/* SCROLLABLE RESULTS */}
        <div className="relative z-/20' : 'text-gray-400 border border-transparent hover:bg-white/5'}`} style={{ background: selectedMood === mood.name ? `linear-gradient(90deg, ${mood.color}, ${mood.accentColor})` : 'transparent' }}>
                    {mood.name}
                </button>
                ))}
            </div>
            {/* Search */}
            <div className="w-full max-w-3xl flex flex-col gap-0 shadow-2xl rounded-2xl overflow-hidden border border-white/20 relative z-40">
                <div className="flex w-full bg-[#161b22]/90 backdrop-blur-md">
                    <button className={`flex-1 py-3 text-sm font-semibold tracking-wide transition-colors ${mode === "discover" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`} onClick={() => setMode("discover")}>Discover Movies</button>
                    <button-w-3xl px-6 py-3 bg-red-500/20 text-red-200 border border-red-500/50 rounded-lg text-sm text-center">{error}</div>}
            
            {loading && (
                <div className="flex flex-col items-center gap-4 mt-20 animate-pulse">
                    <div className="h-1 w-161b22] flex-1">
                                <h3 className="text-white font-bold text-sm leading-tight">{movie.title} <span className="text-gray-500 font-normal">({movie.year})</span></h3>
                                {movie.curatorNote && (
                                    <div10 flex-1 overflow-y-auto custom-scrollbar w-full px-4 md:px-10 pb-10 pt-4">
            {error && <div className="mx-auto max-w-3xl px-6 py-3 bg-red-500/20 text-red-2 className={`flex-1 py-3 text-sm font-semibold tracking-wide transition-colors ${mode === "ask" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`} onClick={() => setMode("ask")}>Ask Expert</button>24 bg-white/20 rounded overflow-hidden"><div className="h-full bg-white animate-progress"></div></div>
                    <span className="text-white/50 text-sm font-light tracking-widest uppercase">Consulting the archives...</span>
                </div>
            )}

            {/* ASK RESULTS */}
            {mode === "ask" && askResult && !loading && (
                <div className="mx-auto p-8 rounded-2xl bg-[#161b22]/95 backdrop-blur-xl border border-gray-700/50 shadow-2xl max-w-4xl animate-fade- className="mt-auto pt-3 border-t border-gray-700/50">
                                        <p className="text-[11px] text-cyan-200 italic leading-relaxed">"{movie.curatorNote}"</p>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
```00 border border-red-500/50 rounded-lg text-sm text-center">{error}</div>}
            
            {loading && (
                <div className="flex flex-col items-center gap-4 mt-20 animate-pulse">
                    <div className="h-1 w-24 bg-white/20 rounded overflow-hidden"><div className="h-full bg-white animate-progress">
                </div>
                <form className="flex w-full bg-black/60 backdrop-blur-xl p-2" onSubmit={(e) => handleSearch(e)}>
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder={mode === "discover" ? "Describe a vibe..." : "Ask a film question..."} className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-base md:text-lg px-4 py-3"
