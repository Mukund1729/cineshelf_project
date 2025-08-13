import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { getPopularMovies, searchMovies, searchPeople, getPopularTVShows, getTrendingMovies } from '../api/tmdb';
import { searchTVShows } from '../api/searchTVShows';
import LoadingSpinner from '../components/LoadingSpinner';
import AuthModal from '../components/AuthModal';
import SearchBar from '../components/SearchBar';
import GenreHighlights from '../components/GenreHighlights';
import taxiDriverBg from '../components/498279.jpg'; // Import the background image


export default function HomePage() {
  // ...existing code...
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [userLists, setUserLists] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  // Function to refresh sidebar data
  const refreshSidebarData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setSidebarLoading(true);
    try {
      const [profileRes, watchlistRes, listsRes, reviewsRes] = await Promise.all([
        axios.get('/api/user/profile', { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }),
        axios.get('/api/watchlist', { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }),
        axios.get('/api/list', { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }),
        axios.get('/api/review', { headers: { Authorization: `Bearer ${token}` }, withCredentials: true })
      ]);
      setProfile(profileRes.data || null);
      setWatchlist(watchlistRes.data?.movies || []);
      setUserLists(listsRes.data?.movies || []);
      setUserReviews(reviewsRes.data || []);
    } catch (error) {
      console.error('Error refreshing sidebar data:', error);
      setProfile(null);
      setWatchlist([]);
      setUserLists([]);
      setUserReviews([]);
    } finally {
      setSidebarLoading(false);
    }
  };

  useEffect(() => {
    refreshSidebarData();
  }, []);

  // Refresh data every 30 seconds to keep it in sync
  useEffect(() => {
    const interval = setInterval(() => {
      if (profile) { // Only refresh if user is logged in
        refreshSidebarData();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [profile]);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [addingId, setAddingId] = useState(null); // for loading state

  // Add to watchlist handler
  const handleAddToWatchlist = async (movie) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setToast({ message: 'Please sign in to add to watchlist.', type: 'error' });
      return;
    }
    setAddingId(movie.id || movie.tmdbId);
    try {
      // Debug: Log the movie data being sent
      console.log('Adding to watchlist:', movie);
      const watchlistData = {
        tmdbId: movie.id || movie.tmdbId,
        title: movie.title || movie.name,
        name: movie.name, // For TV shows
        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        poster_path: movie.poster_path,
        overview: movie.overview,
        release_date: movie.release_date,
        first_air_date: movie.first_air_date, // For TV shows
        vote_average: movie.vote_average,
        genre_ids: movie.genre_ids,
        mediaType: movie.name ? 'tv' : 'movie', // Determine if it's a TV show or movie
      };
      console.log('Sending to backend:', watchlistData);
      
      await axios.post('/api/watchlist', watchlistData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setToast({ message: 'Added to watchlist!', type: 'success' });
      // Refresh sidebar data to show the new item
      setTimeout(() => {
        refreshSidebarData();
      }, 500);
    } catch (err) {
      setToast({ message: 'Failed to add. Try again.', type: 'error' });
    } finally {
      setAddingId(null);
    }
  };
  const [authType, setAuthType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [genreContentLoaded, setGenreContentLoaded] = useState(false);
  const [popularTV, setPopularTV] = useState([]);
  const [searchTVResults, setSearchTVResults] = useState([]);
  const [tvTotalPages, setTVTotalPages] = useState(0);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const debounceRef = useRef();
  const { ref: loadMoreRef, inView } = useInView();
  
  // AI Chatbot state
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);

  // Popular movies infinite query
  const {
    data: popularData,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ['popular-movies'],
    queryFn: ({ pageParam = 1 }) => getPopularMovies(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage && lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !isSearching,
  });

  // Search movies query
  const { data: searchData } = useInfiniteQuery({
    queryKey: ['search-movies', searchQuery],
    queryFn: ({ pageParam = 1 }) => searchMovies(searchQuery, { page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.results) return undefined;
      return lastPage.results.length === 20 ? (lastPage.page || 1) + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: isSearching && searchQuery.length > 0,
  });

  // Search people query
  const { data: peopleData } = useInfiniteQuery({
    queryKey: ['search-people', searchQuery],
    queryFn: ({ pageParam = 1 }) => searchPeople(searchQuery, { page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.results) return undefined;
      return lastPage.results.length === 20 ? (lastPage.page || 1) + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: isSearching && searchQuery.length > 0,
  });

  // Search TV shows query (manual, not react-query for now)
  useEffect(() => {
    let active = true;
    if (isSearching && searchQuery.length > 0) {
      searchTVShows(searchQuery, { page: 1 }).then(res => {
        if (active) {
          setSearchTVResults(res.results || []);
          setTVTotalPages(res.totalPages || 0);
        }
      });
    } else {
      setSearchTVResults([]);
      setTVTotalPages(0);
    }
    return () => { active = false; };
  }, [searchQuery, isSearching]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !isSearching) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, isSearching]);

  // Fetch popular TV shows
  useEffect(() => {
    getPopularTVShows().then(setPopularTV);
  }, []);

  // Fetch trending movies (this week)
  useEffect(() => {
    getTrendingMovies && getTrendingMovies('week').then(res => {
      setTrendingMovies(res || []);
    });
  }, []);

  // Debounced search handler
  const handleSearchInput = (val) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(val);
      setIsSearching(!!val && val.length > 0);
    }, 350);
  };

  // AI Chatbot functions
  const handleAISubmit = async (e) => {
    e.preventDefault();
    if (!aiInput.trim() || aiLoading) return;

    const userMessage = aiInput.trim();
    setAiInput('');
    setAiLoading(true);

    // Add user message
    setAiMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch('/api/gpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are CineSage, a passionate cinephile and film expert. You love discussing cinema, directors, actors, and helping people discover amazing films. Be enthusiastic, knowledgeable, and concise. Keep responses under 150 words.' },
            ...aiMessages,
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          model: 'mistralai/mistral-7b-instruct',
          max_tokens: 150
        })
      });

      const data = await response.json();
      const aiResponse = data.reply || (data.choices && data.choices[0]?.message?.content) || 'Sorry, I could not process your request.';

      setAiMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  const currentData = isSearching ? searchData : popularData;
  const showEmptyState = isSearching && (!searchData || !searchData.pages || searchData.pages[0]?.results?.length === 0);

  if (status === 'pending') return <LoadingSpinner />;
  if (status === 'error') return <div>Error: {error.message}</div>;

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden text-white font-sans">
      {/* Cinematic Taxi Driver-inspired background */}
      <div
        className="fixed inset-0 z-0 w-full h-full pointer-events-none select-none"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(120deg, #0a1833 0%, #181c24 60%, #232526 100%)',
        }}
      >
        <img
          src={taxiDriverBg}
          alt="Taxi Driver NYC Night"
          className="w-full h-full object-cover object-center opacity-40 mix-blend-screen"
          style={{
            filter: 'grayscale(0.2) brightness(0.7) contrast(1.1) blur(0.5px)',
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
        {/* Film grain overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background: 'url("https://www.transparenttextures.com/patterns/asfalt-light.png") repeat',
            opacity: 0.18,
            pointerEvents: 'none',
          }}
        />
        {/* Silhouette overlay (simulate with a dark gradient for now) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            background: 'linear-gradient(180deg, rgba(10,24,51,0.7) 0%, rgba(24,28,36,0.7) 60%, rgba(0,0,0,0.85) 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>
      {/* TMDB-style Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between w-full px-8 py-4 bg-gradient-to-b from-black/90 via-[#181c24]/80 to-transparent backdrop-blur-xl border-b border-[#232526]/40 shadow-lg">
        <div className="flex items-center gap-10">
          <Link to="/" className="text-2xl font-extrabold tracking-tight font-playfair text-white hover:text-cyan-400 transition-colors select-none">visual.cineaste</Link>
          <div className="hidden md:flex gap-x-6 text-base font-semibold text-gray-200">
            <Link to="/discover" className="hover:text-cyan-400 transition">Discover</Link>
            <Link to="/reviews" className="hover:text-cyan-400 transition">Reviews</Link>
            <Link to="/people" className="hover:text-cyan-400 transition">People</Link>
            <Link to="/lists" className="hover:text-cyan-400 transition font-bold">Lists</Link>
            <Link to="/watchlist" className="hover:text-cyan-400 transition font-bold">Watchlist</Link>
            <Link to="/boxoffice" className="hover:text-cyan-400 transition">Box Office</Link>
            <Link to="/compare" className="hover:text-cyan-400 transition font-bold">Compare</Link>
          </div>
        </div>
        {/* Cinematic Picks right before login/signup */}
        <div className="flex items-center gap-6">
          <Link to="/cinematic-picks" className="text-base font-semibold text-pink-300 hover:text-pink-400 transition font-bold">Cinematic Picks</Link>
          {/* Profile Icon (Login/Signup or User Menu) */}
          <div className="relative group">
            {profile ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <img 
                    src={profile.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjMDY2NjY2Ii8+CjxjaXJjbGUgY3g9IjE2IiBjeT0iMTAiIHI9IjQiIGZpbGw9IiMzQngzQngzIi8+CjxwYXRoIGQ9Ik0yIDI2QzIgMjQgNC4zIDIyIDcgMjJIMjVDMjcuNyAyMiAzMCAyNCAzMCAyNlYzMEgyVjI2WiIgZmlsbD0iIzNCeDNCODMiLz4KPC9zdmc+Cg=='} 
                    alt={profile.username} 
                    className="w-8 h-8 rounded-full border-2 border-cyan-400/40 object-cover"
                  />
                  <span className="text-cyan-200 font-semibold text-sm hidden md:block">{profile.username}</span>
                </div>
                <div className="relative group">
                  <button
                    className="p-2 rounded-full hover:bg-[#232526]/60 transition flex items-center justify-center"
                    aria-label="User menu"
                    tabIndex={0}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-[#232526] rounded-lg shadow-xl border border-[#181c24] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-200 hover:bg-[#181c24] transition">
                        Profile
                      </Link>
                      <Link to="/watchlist" className="block px-4 py-2 text-sm text-gray-200 hover:bg-[#181c24] transition">
                        Watchlist
                      </Link>
                      <Link to="/lists" className="block px-4 py-2 text-sm text-gray-200 hover:bg-[#181c24] transition">
                        My Lists
                      </Link>
                      <Link to="/reviews" className="block px-4 py-2 text-sm text-gray-200 hover:bg-[#181c24] transition">
                        My Reviews
                      </Link>
                      <hr className="border-[#181c24] my-1" />
                      <button
                        onClick={() => {
                          localStorage.removeItem('token');
                          localStorage.removeItem('user');
                          setProfile(null);
                          setWatchlist([]);
                          setUserLists([]);
                          setUserReviews([]);
                          alert('Logged out successfully!');
                          window.location.reload();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#181c24] transition"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                className="p-2 rounded-full hover:bg-[#232526]/60 transition flex items-center justify-center"
                onClick={e => {
                  e.stopPropagation();
                  setAuthType('login');
                }}
                aria-label="Open login/signup"
                tabIndex={0}
              >
                {/* Heroicon: UserCircle */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </nav>
      {/* Responsive main layout with sidebar for wide screens */}
      <div className="pt-24 pb-24 flex-1 relative z-10 flex flex-row gap-8 max-w-screen-2xl mx-auto w-full">
        {/* Sidebar for wide screens (personalized, trending, or filler) */}
        <aside className="hidden xl:flex flex-col min-w-[240px] max-w-[280px] h-full sticky top-24 z-20 gap-6">
          {/* User Teaser: dynamic profile */}
          <div className="bg-gradient-to-br from-[#232526]/80 to-[#181c24]/90 rounded-2xl shadow-2xl p-5 border border-[#232526]/60 backdrop-blur-xl flex items-center gap-4 mb-2">
            {sidebarLoading ? (
              <div className="w-full text-center text-xs text-gray-400">Loading...</div>
            ) : profile ? (
              <>
                <img src={profile.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMDY2NjY2Ii8+CjxjaXJjbGUgY3g9IjI0IiBjeT0iMTUiIHI9IjYiIGZpbGw9IiMzQngzQngzIi8+CjxwYXRoIGQ9Ik0zIDM5QzMgMzYgNS4zIDMzIDggMzNIMTBDMTIuNyAzMyAxNSAzNiAxNSAzOVY0NUgzVjM5WiIgZmlsbD0iIzNCeDNCODMiLz4KPC9zdmc+Cg=='} alt="avatar" className="w-12 h-12 rounded-full border-2 border-cyan-400/40 object-cover" />
                <div className="flex-1">
                  <div className="text-white font-bold text-base">{profile.username}</div>
                  <div className="text-xs text-cyan-300">{profile.email}</div>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-700/60 to-cyan-400/40 flex items-center justify-center overflow-hidden border-2 border-cyan-400/40">
                  <svg className="w-8 h-8 text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div className="flex-1">
                  <div className="text-white font-bold text-base">Guest</div>
                  <button 
                    onClick={() => setAuthType('login')}
                    className="text-xs text-cyan-300 hover:underline mt-1"
                  >
                    Sign in
                  </button>
                </div>
              </>
            )}
          </div>
          {/* Watchlist Card: dynamic from backend */}
          <div className="bg-gradient-to-br from-[#181c24]/80 to-[#232526]/90 rounded-2xl shadow-2xl p-5 border border-[#232526]/60 backdrop-blur-xl mb-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5v14l7-7 7 7V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" /></svg>
                <h3 className="text-base font-bold text-cyan-300 tracking-wide uppercase">Your Watchlist</h3>
              </div>
              <button
                onClick={refreshSidebarData}
                className="text-cyan-300 hover:text-cyan-400 transition-colors"
                title="Refresh data"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {watchlistLoading ? (
                [1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-3 bg-[#232526]/60 rounded-lg p-2 animate-pulse">
                    <div className="w-10 h-14 rounded-md bg-gradient-to-br from-gray-700/40 to-gray-800/60 blur-[1.5px]" />
                    <div className="flex-1">
                      <div className="h-3 w-2/3 bg-gray-700/60 rounded mb-1" />
                      <div className="h-2 w-1/3 bg-gray-700/40 rounded" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-cyan-700/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </div>
                  </div>
                ))
              ) : watchlist && watchlist.length > 0 ? (
                watchlist.slice(0, 3).map(movie => (
                  <div key={movie.tmdbId} className="flex items-center gap-3 bg-[#232526]/60 rounded-lg p-2">
                    <img 
                      src={movie.poster || movie.posterUrl || (movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : null) || 'https://via.placeholder.com/40x56?text=No+Image'} 
                      alt={movie.title} 
                      className="w-10 h-14 rounded-md object-cover"
                      onError={e => { 
                        e.target.onerror = null; 
                        e.target.src = 'https://via.placeholder.com/40x56?text=No+Image'; 
                      }}
                    />
                    <div className="flex-1">
                      <div className="text-sm text-white font-semibold truncate">{movie.title}</div>
                      <div className="text-xs text-gray-400">{movie.mediaType === 'tv' ? 'TV Show' : 'Movie'} • ID: {movie.tmdbId}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-400">Sign in to see your personalized picks and quick actions here.</div>
              )}
            </div>
          </div>
          {/* User Lists Card: dynamic from backend */}
          <div className="bg-gradient-to-br from-[#181c24]/80 to-[#232526]/90 rounded-2xl shadow-2xl p-5 border border-[#232526]/60 backdrop-blur-xl mb-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                <h3 className="text-base font-bold text-pink-300 tracking-wide uppercase">Your Lists</h3>
              </div>
              <button
                onClick={refreshSidebarData}
                className="text-pink-300 hover:text-pink-400 transition-colors"
                title="Refresh data"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {sidebarLoading ? (
                <div className="text-xs text-gray-400">Loading...</div>
              ) : userLists && userLists.length > 0 ? (
                userLists.slice(0, 3).map(list => (
                  <div key={list.tmdbId} className="flex items-center gap-3 bg-[#232526]/60 rounded-lg p-2">
                    <img 
                      src={list.poster || list.posterUrl || `https://image.tmdb.org/t/p/w92${list.poster_path}` || 'https://via.placeholder.com/40x56?text=No+Image'} 
                      alt={list.title} 
                      className="w-10 h-14 rounded-md object-cover"
                      onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/40x56?text=No+Image'; }}
                    />
                    <div className="flex-1">
                      <div className="text-sm text-white font-semibold truncate">{list.title}</div>
                      {list.rating && (
                        <div className="text-xs text-yellow-300 font-bold">⭐ {list.rating}/10</div>
                      )}
                      <div className="text-xs text-gray-400">{list.mediaType === 'tv' ? 'TV Show' : 'Movie'} • ID: {list.tmdbId}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-400">No lists found.</div>
              )}
            </div>
          </div>
          {/* Reviews Summary Card: dynamic from backend */}
          <div className="bg-gradient-to-br from-[#232526]/80 to-[#181c24]/90 rounded-2xl shadow-2xl p-5 border border-[#232526]/60 backdrop-blur-xl mb-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17.75l-6.16 3.24 1.18-6.88L2 9.51l6.92-1.01L12 2.5l3.08 6.01 6.92 1.01-5.02 4.6 1.18 6.88z" /></svg>
                <h3 className="text-base font-bold text-yellow-300 tracking-wide uppercase">Your Reviews</h3>
              </div>
              <button
                onClick={refreshSidebarData}
                className="text-yellow-300 hover:text-yellow-400 transition-colors"
                title="Refresh data"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {sidebarLoading ? (
                <div className="text-xs text-gray-400">Loading...</div>
              ) : userReviews && userReviews.length > 0 ? (
                userReviews.slice(0, 3).map(review => (
                  <div key={review._id} className="flex items-center gap-3 bg-[#232526]/60 rounded-lg p-2">
                    <img 
                      src={review.poster || review.posterUrl || `https://image.tmdb.org/t/p/w92${review.poster_path}` || 'https://via.placeholder.com/40x56?text=No+Image'} 
                      alt={review.title} 
                      className="w-10 h-14 rounded-md object-cover"
                      onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/40x56?text=No+Image'; }}
                    />
                    <div className="flex-1">
                      <div className="text-sm text-white font-semibold truncate">{review.title}</div>
                      <div className="text-xs text-yellow-300 font-bold">⭐ {review.rating}/10</div>
                      <div className="text-xs text-gray-400 truncate">{review.comment || review.review}</div>
                      {review.mediaType && (
                        <div className="text-xs text-gray-500">{review.mediaType === 'tv' ? 'TV Show' : 'Movie'}</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-400">No reviews found.</div>
              )}
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#232526]/80 to-[#181c24]/90 rounded-2xl shadow-xl p-5 border border-[#232526]/60 backdrop-blur-xl flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m4 4v-4a4 4 0 00-8 0v4" /></svg>
              <h3 className="text-base font-bold text-pink-300 tracking-wide uppercase">Cinematic Stats</h3>
            </div>
            <div className="h-16 flex items-center justify-center text-gray-500 text-sm">More features soon</div>
          </div>
        </aside>
        {/* Main content */}
        <main className="flex-1 min-w-0">
        {/* HERO SECTION + Search Bar with glassmorphism */}
        <section className="w-full flex flex-col items-center justify-center mt-8 mb-6 pb-2">
          <div className="w-full max-w-xl mx-auto bg-gradient-to-br from-[#181c24]/80 to-[#232526]/80 rounded-2xl shadow-2xl border border-[#232526] px-6 py-6 backdrop-blur-xl flex flex-col items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-2 font-sans tracking-tight uppercase tracking-widest" style={{ fontFamily: 'Inter, Poppins, Source Sans Pro, sans-serif' }}>
              Discover Cinema with <span className="text-cyan-400 font-extrabold">visual.<span className="text-white">cineaste</span></span>
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-cyan-400/60 via-pink-400/40 to-transparent rounded-full mb-2" />
            <p className="text-sm text-gray-300 font-normal text-center mb-2 mt-0 max-w-md mx-auto font-sans" style={{ fontFamily: 'Inter, Poppins, Source Sans Pro, sans-serif' }}>
              Explore films by vision, director, style — not just genre.
            </p>
          </div>
        </section>
        <div className="w-full flex justify-center mb-8 px-2">
          <form
            className="w-full max-w-xl flex items-center bg-gradient-to-br from-[#181c24]/80 to-[#232526]/80 rounded-full shadow-2xl border border-[#232526] focus-within:ring-2 focus-within:ring-cyan-400 px-3 py-2 backdrop-blur-xl"
            onSubmit={e => {
              e.preventDefault();
              handleSearchInput(searchQuery);
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setIsSearching(!!e.target.value && e.target.value.length > 0);
              }}
              placeholder="Search by movie, director, style, or mood..."
              className="flex-1 bg-transparent outline-none px-2 py-1 text-base font-sans text-white rounded-full placeholder:text-gray-400"
              style={{ fontFamily: 'Inter, Poppins, Source Sans Pro, sans-serif' }}
            />
            <button
              type="submit"
              className="ml-1 text-cyan-400 text-xl p-1 rounded-full hover:bg-[#232526]/60 transition flex items-center justify-center"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </button>
          </form>
        </div>
        {/* Search Results (show directly below search bar) */}
        {isSearching && (
          <main className="container mx-auto px-4 py-4">
            {/* People Results */}
            {peopleData?.pages?.[0]?.results?.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold font-playfair text-cyan-300 mb-4">People</h2>
                <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-[#232526] scrollbar-track-transparent">
                  {peopleData.pages[0].results.filter(p => p.profile_path).slice(0, 8).map(person => (
                    <Link to={`/person/${person.id}`} key={person.id} className="min-w-[100px] max-w-[100px] flex-shrink-0 bg-[#181c24] rounded-lg overflow-hidden shadow-md hover:scale-105 hover:shadow-cyan-400 transition-transform duration-200 flex flex-col items-center">
                      <img
                        src={`https://image.tmdb.org/t/p/w200${person.profile_path}`}
                        alt={person.name}
                        className="w-full h-32 object-cover rounded-t-lg"
                        onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/200x300?text=No+Image'; }}
                      />
                      <h3 className="text-white font-semibold text-xs text-center p-1 line-clamp-2 font-lato">{person.name}</h3>
                      <span className="text-cyan-300 font-bold mb-2 text-[10px]">{person.known_for_department}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
            {/* TV Show Results */}
            {searchTVResults.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold font-playfair text-blue-300 mb-4">TV Shows</h2>
                <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-[#232526] scrollbar-track-transparent">
                  {searchTVResults.filter(tv => tv.poster_path).slice(0, 8).map(tv => (
                    <Link to={`/tv/${tv.id}`} key={tv.id} className="min-w-[100px] max-w-[100px] flex-shrink-0 bg-[#181c24] rounded-lg overflow-hidden shadow-md hover:scale-105 hover:shadow-blue-400 transition-transform duration-200 flex flex-col items-center">
                      <img
                        src={`https://image.tmdb.org/t/p/w200${tv.poster_path}`}
                        alt={tv.name}
                        className="w-full h-32 object-cover rounded-t-lg"
                        onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/200x300?text=No+Image'; }}
                      />
                      <h3 className="text-white font-semibold text-xs text-center p-1 line-clamp-2 font-lato">{tv.name}</h3>
                      <span className="text-blue-300 font-bold mb-2 text-[10px]">⭐ {tv.vote_average?.toFixed(1) ?? 'N/A'}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
            {/* Movie Results */}
            {showEmptyState ? (
              <div className="text-center py-8">
                <p className="text-base font-lato">No movies found for "{searchQuery}"</p>
                <button 
                  onClick={() => { setIsSearching(false); setSearchQuery(''); }}
                  className="mt-4 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 font-lato text-sm"
                >
                  Back to Search
                </button>
              </div>
            ) : (
              <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-[#232526] scrollbar-track-transparent">
                {currentData?.pages?.flatMap(page =>
                  (page?.results || [])
                    .filter(movie => movie.poster_path)
                    .slice(0, 8)
                    .map(movie => (
                      <Link to={`/movie/${movie.id}`} key={movie.id} className="min-w-[100px] max-w-[100px] flex-shrink-0 bg-[#0f1c2d] rounded-lg overflow-hidden shadow-md flex flex-col items-center hover:scale-105 hover:shadow-blue-400 transition-transform duration-200 cursor-pointer">
                        <img
                          src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                          alt={movie.title}
                          className="w-full h-32 object-cover rounded-t-lg"
                          onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/200x300?text=No+Image'; }}
                        />
                        <h3 className="text-white font-semibold text-xs text-center p-1 line-clamp-2 font-lato">{movie.title}</h3>
                        <span className="text-blue-300 font-bold mb-2 text-[10px]">⭐ {movie.vote_average?.toFixed(1) ?? 'N/A'}</span>
                      </Link>
                    ))
                )}
              </div>
            )}
          </main>
        )}
        {/* Popular TV Shows Section (glassmorphism, overlays, quick actions) */}
        <section className="container mx-auto px-2 mb-6 mt-2 transition-all duration-500">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-lg md:text-xl font-bold text-cyan-300 tracking-widest uppercase">Popular TV Shows</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-cyan-400/40 to-transparent" />
          </div>
          <div
            className="relative overflow-x-auto mt-2 scrollbar-thin scrollbar-thumb-[#232526] scrollbar-track-transparent"
            style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)' }}
          >
            <div
              className="flex gap-3 md:gap-4 lg:gap-5 items-stretch animate-tvtrain min-w-[600px] md:min-w-0"
              style={{
                animation: 'tvtrain 32s linear infinite',
                '--pause': 'paused',
              }}
              onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
              onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}
            >
              {popularTV.concat(popularTV).map((show, idx) => (
                <div
                  key={show.id + '-' + idx}
                  className="bg-gradient-to-br from-[#181c24]/80 to-[#232526]/90 rounded-xl shadow-2xl overflow-hidden hover:scale-105 hover:shadow-cyan-400 transition-transform duration-200 group cursor-pointer min-w-[140px] max-w-[140px] flex-shrink-0 relative backdrop-blur-xl border border-[#232526]/60"
                  onClick={() => window.location.href = `/tv/${show.id}`}
                >
                  <img
                    src={show.poster_path ? `https://image.tmdb.org/t/p/w200${show.poster_path}` : '/placeholder.jpg'}
                    alt={show.name}
                    className="w-full h-44 object-cover rounded-t-xl group-hover:opacity-90 transition"
                  />
                  {/* Overlay with title, rating, quick action */}
                  <div className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition bg-gradient-to-t from-black/80 to-transparent p-3">
                    <div className="flex flex-col gap-1">
                      <div className="text-white font-bold text-xs font-lato truncate text-shadow">{show.name}</div>
                      <span className="text-cyan-300 font-bold text-xs">⭐ {show.vote_average?.toFixed(1) ?? 'N/A'}</span>
                      <button
                        className={`mt-1 px-2 py-1 bg-cyan-600/80 hover:bg-cyan-400/90 text-xs text-white rounded shadow font-bold transition flex items-center gap-1 ${addingId === show.id ? 'opacity-60 pointer-events-none' : ''}`}
                        onClick={e => { e.stopPropagation(); handleAddToWatchlist(show); }}
                        disabled={addingId === show.id}
                      >
                        {addingId === show.id ? (
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                        ) : (
                          <span>+ Watchlist</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <style>{`
              @keyframes tvtrain {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-tvtrain {
                animation-play-state: running;
              }
              .text-shadow {
                text-shadow: 0 2px 8px #000, 0 1px 2px #000;
              }
            `}</style>
          </div>
        </section>
        {/* Trending This Week Section (glassmorphism, overlays, quick actions) */}
        {!isSearching && trendingMovies.length > 0 && (
          <section className="container mx-auto px-2 mb-6 mt-2 transition-all duration-500">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-lg md:text-xl font-bold text-cyan-300 tracking-widest uppercase">Trending This Week</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-cyan-400/40 to-transparent" />
            </div>
            <div className="relative overflow-x-auto mt-2 scrollbar-thin scrollbar-thumb-[#232526] scrollbar-track-transparent"
              style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)' }}>
              <div
                className="flex gap-3 md:gap-4 lg:gap-5 items-stretch animate-train min-w-[600px] md:min-w-0"
                style={{
                  animation: 'train 32s linear infinite',
                  '--pause': 'paused',
                }}
                onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
                onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}
              >
                {trendingMovies.concat(trendingMovies).filter(m => m.poster_path).slice(0, 32).map(movie => (
                  <div key={movie.id + '-' + Math.random()} className="bg-gradient-to-br from-[#181c24]/80 to-[#232526]/90 rounded-xl shadow-2xl overflow-hidden hover:scale-105 hover:shadow-cyan-400 transition-transform duration-200 group cursor-pointer min-w-[140px] max-w-[140px] flex-shrink-0 relative backdrop-blur-xl border border-[#232526]/60">
                    <img
                      src={movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : '/placeholder.jpg'}
                      alt={movie.title}
                      className="w-full h-44 object-cover rounded-t-xl group-hover:opacity-90 transition"
                      onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/200x300?text=No+Image'; }}
                    />
                    {/* Overlay with title, rating, quick action */}
                    <div className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition bg-gradient-to-t from-black/80 to-transparent p-3">
                      <div className="flex flex-col gap-1">
                        <div className="text-white font-bold text-xs font-lato truncate text-shadow line-clamp-2">{movie.title}</div>
                        <span className="text-cyan-300 font-bold text-xs">⭐ {movie.vote_average?.toFixed(1) ?? 'N/A'}</span>
                        <button
                          className={`mt-1 px-2 py-1 bg-cyan-600/80 hover:bg-cyan-400/90 text-xs text-white rounded shadow font-bold transition flex items-center gap-1 ${addingId === movie.id ? 'opacity-60 pointer-events-none' : ''}`}
                          onClick={e => { e.stopPropagation(); handleAddToWatchlist(movie); }}
                          disabled={addingId === movie.id}
                        >
                          {addingId === movie.id ? (
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                          ) : (
                            <span>+ Watchlist</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <style>{`
                @keyframes train {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .animate-train {
                  animation-play-state: running;
                }
                .text-shadow {
                  text-shadow: 0 2px 8px #000, 0 1px 2px #000;
                }
              `}</style>
            </div>
          </section>
        )}
        {/* Explore by Category Section (glassmorphism, genre tile polish) */}
        <section className="container mx-auto px-2 mb-12 mt-2 transition-all duration-500">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-lg md:text-xl font-bold text-cyan-300 tracking-widest uppercase">Explore by Category</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-cyan-400/40 to-transparent" />
          </div>
          <div className="relative overflow-x-auto mt-1 scrollbar-thin scrollbar-thumb-[#232526] scrollbar-track-transparent"
            style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)' }}>
            <div className="flex gap-2 md:gap-3 items-stretch min-w-[600px] md:min-w-0">
              <GenreHighlights
                onGenreContentLoaded={() => setGenreContentLoaded(true)}
                cardClassName="hover:scale-105 hover:shadow-cyan-400 shadow-xl rounded-xl transition-transform duration-200 p-2 bg-gradient-to-br from-[#181c24]/80 to-[#232526]/80 text-white text-shadow min-h-[90px] min-w-[90px] max-w-[110px] max-h-[110px] flex flex-col items-center justify-center border border-[#232526]/60 backdrop-blur-xl"
                gridClassName="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3 min-w-[600px] md:min-w-0"
              />
            </div>
          </div>
        </section>
        {/* Trending Now Section */}
        {!isSearching && popularData?.pages?.[0]?.results?.length > 0 && (
          <section className="container mx-auto px-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-playfair text-pink-400 mb-6 flex items-center justify-between">
              <span>Trending Now</span>
              <Link to="/trending" className="text-sm font-semibold text-pink-200 hover:text-pink-400 transition underline ml-4">See All Trending</Link>
            </h2>
            <div className="flex overflow-x-auto gap-8 pb-4 scrollbar-thin scrollbar-thumb-[#232526] scrollbar-track-transparent">
              {popularData.pages[0].results.filter(m => m.poster_path).slice(0, 12).map(movie => (
                <Link to={`/movie/${movie.id}`} key={movie.id} className="min-w-[220px] max-w-[220px] flex-shrink-0 bg-[#181c24] rounded-2xl overflow-hidden shadow-2xl hover:scale-105 hover:shadow-pink-400 transition-transform duration-200 group relative">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-80 object-cover rounded-t-2xl group-hover:brightness-75 transition duration-200"
                    onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'; }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-white font-bold text-lg font-playfair mb-1">{movie.title}</h3>
                    <span className="text-pink-300 font-bold">⭐ {movie.vote_average?.toFixed(1) ?? 'N/A'}</span>
                  </div>
                </Link>
              ))}
            </div>
            {/* Infinite scroll sentinel */}
            <div ref={loadMoreRef} className="h-8 w-full" />
          </section>
        )}
        {/* Show loading spinner when fetching next page of popular movies */}
        {!isSearching && isFetchingNextPage && (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner />
          </div>
        )}
        </main>
      </div>
      {/* Toast Feedback */}
      {toast.message && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-2 rounded shadow-lg text-white ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}
          onClick={() => setToast({ message: '', type: 'success' })}>
          {toast.message}
        </div>
      )}
      {/* Footer */}
      <footer className="bg-gray-800 py-4 w-full mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-gray-400 font-lato">© {new Date().getFullYear()} visual.cineaste. All rights reserved.</p>
        </div>
      </footer>
      {/* Welcome Message */}
      {showWelcomeMessage && (
        <div className="fixed bottom-24 right-6 z-50 animate-bounce">
          <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 rounded-2xl shadow-2xl p-4 max-w-xs">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">🎬 Meet CineSage!</h3>
                <p className="text-white/90 text-xs">Your AI Film Expert</p>
              </div>
            </div>
            <p className="text-white/90 text-xs mb-3">Ask me about movies, directors, or get personalized recommendations!</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAIChat(true);
                  setShowWelcomeMessage(false);
                }}
                className="flex-1 bg-white/20 text-white text-xs font-semibold py-2 px-3 rounded-lg hover:bg-white/30 transition-colors"
              >
                Start Chat
              </button>
              <button
                onClick={() => setShowWelcomeMessage(false)}
                className="text-white/70 text-xs hover:text-white transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* AI Chat Toggle Button */}
        {!showAIChat && (
          <button
            onClick={() => setShowAIChat(true)}
            className="w-16 h-16 bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 rounded-full shadow-2xl hover:shadow-pink-400/50 hover:scale-110 transition-all duration-300 flex items-center justify-center group animate-pulse"
            aria-label="Chat with CineSage"
          >
            <div className="relative">
              <svg className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-bounce"></div>
            </div>
          </button>
        )}

        {/* AI Chat Window */}
        {showAIChat && (
          <div className="w-80 h-96 bg-gradient-to-br from-[#181c24]/95 to-[#232526]/95 rounded-2xl shadow-2xl border border-[#232526]/60 backdrop-blur-xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#232526]/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">CineSage</h3>
                  <p className="text-pink-300 text-xs">Your Film Expert</p>
                </div>
              </div>
              <button
                onClick={() => setShowAIChat(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {aiMessages.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-8">
                  <svg className="w-8 h-8 mx-auto mb-2 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-pink-300 font-semibold mb-1">🎬 Welcome to CineSage!</p>
                  <p>Ask me about movies, directors, or get recommendations!</p>
                </div>
              )}
              
              {aiMessages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white' 
                      : 'bg-[#232526]/80 text-gray-200'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#232526]/80 rounded-2xl px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-pink-400 border-t-transparent"></div>
                      <span className="text-sm text-gray-300">🎬 CineSage is analyzing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleAISubmit} className="p-4 border-t border-[#232526]/40">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask CineSage about films..."
                  className="flex-1 bg-[#232526]/60 text-white text-sm rounded-lg px-3 py-2 outline-none border border-[#232526]/40 focus:border-pink-400/60"
                  disabled={aiLoading}
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiInput.trim()}
                  className="px-3 py-2 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {authType && (
        <AuthModal 
          type={authType} 
          onClose={() => setAuthType(null)}
          onSwitch={() => setAuthType(authType === 'login' ? 'signup' : 'login')}
        />
      )}
    </div>
  );
}