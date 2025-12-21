
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const RELATIONSHIP_TYPES = [
  'Cinephile Friend',
  'Movie Buddy',
  'Sakha',
  'Film Companion',
  'Screen Pal',
  'Watchlist Partner',
];

export default function People() {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRelationship, setSelectedRelationship] = useState(RELATIONSHIP_TYPES[0]);

  // Load current user and friends on component mount
  useEffect(() => {
    const loadUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const [profileRes, friendsRes] = await Promise.all([
          axios.get('/api/user/profile', { 
            headers: { Authorization: `Bearer ${token}` }, 
            withCredentials: true 
          }),
          axios.get('/api/user/friends', { 
            headers: { Authorization: `Bearer ${token}` }, 
            withCredentials: true 
          })
        ]);
        
  // Ensure currentUser is the real MongoDB user object
  setCurrentUser(profileRes.data.user || profileRes.data);
        setFriends(friendsRes.data || []);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Search users function
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    setSearchLoading(true);
    try {
      const response = await axios.get(`/api/user/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      // Only show real users from MongoDB, not demo/dummy
      setSearchResults(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search input with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search.trim()) {
        searchUsers(search);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  // Add friend function with relationship type
  const handleAddFriend = async (userId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.post('/api/user/friends', {
        friendId: userId,
        relationship: selectedRelationship
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      // Refresh friends list
      const friendsRes = await axios.get('/api/user/friends', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setFriends(friendsRes.data || []);
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  // Remove friend function
  const handleRemoveFriend = async (userId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(`/api/user/friends/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      
      // Refresh friends list
      const friendsRes = await axios.get('/api/user/friends', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setFriends(friendsRes.data || []);
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#181c24] via-[#232526] to-[#0a1833] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181c24] via-[#232526] to-[#0a1833] text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between w-full px-8 py-4 bg-gradient-to-b from-black/90 via-[#181c24]/60 to-transparent backdrop-blur-md">
        <Link to="/" className="text-2xl font-extrabold tracking-tight font-playfair text-white hover:text-cyan-400 transition-colors select-none">
          visual.cineaste
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-base font-semibold text-gray-200 hover:text-cyan-400 transition">Home</Link>
          <Link to="/discover" className="text-base font-semibold text-gray-200 hover:text-cyan-400 transition">Discover</Link>
          <Link to="/people" className="text-base font-semibold text-cyan-400 transition">People</Link>
        </div>
      </div>

      <div className="pt-24 flex flex-row gap-8 px-4 py-8">
        {/* Sidebar: Your Profile */}
      {/* Profile Card at top like profile page */}
      {/* Left profile card: show logged-in user's real details from MongoDB */}
      <aside className="hidden md:flex flex-col min-w-[260px] max-w-[300px] h-full sticky top-24 z-20 gap-8">
        <div className="bg-gradient-to-br from-[#232526]/80 to-[#181c24]/90 rounded-2xl shadow-2xl p-8 border border-cyan-700 flex flex-col items-center gap-4">
          <img 
            src={currentUser?.avatarUrl || 'https://placehold.co/80x80?text=Avatar'} 
            alt={currentUser?.username || ''} 
            className="w-24 h-24 rounded-full border-4 border-cyan-400 shadow-lg object-cover mb-2" 
          />
          <div className="text-white font-bold text-2xl font-playfair tracking-wide">
            {currentUser?.username}
          </div>
          <div className="text-cyan-300 text-base font-semibold">
            {currentUser?.email}
          </div>
          <div className="text-pink-300 text-xs mb-2">
            Member since {currentUser?.createdAt ? new Date(currentUser.createdAt).getFullYear() : ''}
          </div>
          <div className="w-full mt-2">
            <div className="text-cyan-400 text-xs font-bold mb-2">Your Stats</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#232526]/60 rounded p-2 text-center">
                <div className="text-white font-bold">{friends.length}</div>
                <div className="text-gray-400">Sakha</div>
              </div>
              <div className="bg-[#232526]/60 rounded p-2 text-center">
                <div className="text-white font-bold">0</div>
                <div className="text-gray-400">Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center">
          <div className="w-full max-w-4xl mx-auto">
            {/* Main Section about Sakha */}
            <div className="flex flex-col items-center mb-12">
              <h1 className="text-5xl font-extrabold font-playfair tracking-tight text-cyan-300 drop-shadow-lg mb-4">
                Your <span className="text-white">Sakha</span> Connections
              </h1>
              <p className="text-gray-400 text-lg mb-8 text-center max-w-2xl">
                <span className="text-pink-300 font-bold">Sakha</span> means a close companion. Add sakha, movie buddies, and film partners to share reviews, lists, and watchlists. Your sakha circle makes every movie night special!
              </p>
              {/* Search Bar and Results below */}
              <div className="w-full max-w-md mb-4">
                <div className="relative">
                  <input
                    className="w-full bg-gradient-to-br from-[#181c24]/80 to-[#232526]/80 text-white rounded-2xl px-6 py-4 outline-none border border-[#232526]/60 focus:border-cyan-400 shadow-2xl backdrop-blur-xl placeholder:text-gray-400"
                    placeholder="Search for users by username..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  {searchLoading && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-cyan-400 border-t-transparent"></div>
                    </div>
                  )}
                </div>
              </div>
              {/* Search Results directly below search bar */}
              {searchResults.length > 0 && (
                <div className="mb-8 w-full max-w-md">
                  <div className="text-cyan-400 font-bold text-lg mb-4 font-playfair tracking-wide flex items-center gap-3">
                    Search Results
                  </div>
                  <div className="space-y-4">
                    {searchResults.map(user => (
                      <div key={user._id} className="bg-gradient-to-br from-[#232526]/80 to-[#181c24]/90 rounded-xl shadow-xl p-4 border border-cyan-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={user.avatarUrl || 'https://placehold.co/40x40?text=User'} alt={user.username} className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400" />
                          <div>
                            <div className="font-bold text-cyan-200">{user.username}</div>
                            <div className="text-xs text-gray-400">{user.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="px-3 py-1 bg-cyan-600 rounded-full text-xs font-bold hover:bg-cyan-700 transition-all"
                            onClick={() => handleAddFriend(user._id)}
                          >Connect as Sakha</button>
                          <button
                            className="px-3 py-1 bg-pink-600 rounded-full text-xs font-bold hover:bg-pink-700 transition-all"
                            onClick={() => window.location.href = `/profile/${user._id}`}
                          >View Details</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mb-12 w-full">
                <div className="text-cyan-400 font-bold text-xl mb-6 font-playfair tracking-wide flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Results
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map(user => (
                    <div key={user._id} className="bg-gradient-to-br from-[#232526]/80 to-[#181c24]/90 rounded-2xl shadow-2xl p-6 border border-[#232526]/60 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-cyan-400/20">
                      <div className="flex flex-col items-center text-center gap-4">
                        <img 
                          src={user.avatar || 'https://placehold.co/80x80?text=Avatar'} 
                          alt={user.username} 
                          className="w-16 h-16 rounded-full border-3 border-cyan-400 shadow-lg object-cover" 
                        />
                        <div>
                          <div className="text-white font-bold text-lg font-playfair">{user.username}</div>
                          <div className="text-cyan-300 text-sm">{user.email}</div>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                          <select
                            className="bg-[#232526] text-cyan-200 border border-cyan-700 rounded px-2 py-1 text-xs mb-2"
                            value={selectedRelationship}
                            onChange={e => setSelectedRelationship(e.target.value)}
                          >
                            {RELATIONSHIP_TYPES.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          <div className="flex gap-2 w-full">
                            {friends.some(f => f._id === user._id) ? (
                              <button 
                                onClick={() => handleRemoveFriend(user._id)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 text-sm font-semibold"
                              >
                                Remove Friend
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleAddFriend(user._id)}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 text-sm font-semibold"
                              >
                                Add Friend
                              </button>
                            )}
                            <button className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200 text-sm font-semibold">
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Your Friends */}
            <div className="w-full">
              <div className="text-pink-400 font-bold text-xl mb-6 font-playfair tracking-wide flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Your Sakha ({friends.length})
              </div>
              
              {friends.length === 0 ? (
                <div className="flex flex-col items-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="text-gray-400 text-lg mb-4 text-center">No Sakha yet</div>
                  <div className="text-gray-500 text-sm text-center mb-6">
                    Start by searching for other cinephiles above and add them as Sakha!
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 font-semibold">
                    Find Sakha
                  </button>
              </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {friends.map(friend => (
                    <div key={friend._id || friend.friend?._id} className="bg-gradient-to-br from-[#232526]/80 to-[#181c24]/90 rounded-2xl shadow-2xl p-6 border border-pink-800/40 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-pink-400/20">
                      <div className="flex flex-col items-center text-center gap-4">
                        <img 
                          src={friend.avatar || friend.friend?.avatar || 'https://placehold.co/80x80?text=Avatar'} 
                          alt={friend.username || friend.friend?.username} 
                          className="w-16 h-16 rounded-full border-3 border-pink-400 shadow-lg object-cover" 
                        />
                        <div>
                          <div className="text-white font-bold text-lg font-playfair">{friend.username || friend.friend?.username}</div>
                          <div className="text-pink-300 text-sm">{friend.email || friend.friend?.email}</div>
                          {friend.relationship && (
                            <div className="text-xs text-yellow-300 italic mt-1">{friend.relationship}</div>
                          )}
                        </div>
                        <div className="flex gap-2 w-full">
                          <button 
                            onClick={() => handleRemoveFriend(friend._id || friend.friend?._id)}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 text-sm font-semibold"
                          >
                            Remove
                          </button>
                          <button className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200 text-sm font-semibold">
                            Message
                          </button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        </main>
        </div>
    </div>
  );
}
