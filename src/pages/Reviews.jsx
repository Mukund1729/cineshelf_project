import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Reviews() {
  const [myReviews, setMyReviews] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendReviews, setFriendReviews] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setLoading(true);
    axios.get('/api/review', { headers: { Authorization: `Bearer ${token}` }, withCredentials: true })
      .then(res => setMyReviews(res.data || []))
      .catch(() => setMyReviews([]));
    axios.get('/api/user/friends', { headers: { Authorization: `Bearer ${token}` }, withCredentials: true })
      .then(res => {
        setFriends(res.data || []);
        // Fetch each friend's reviews
        Promise.all((res.data || []).map(friend =>
          axios.get(`/api/review?user=${friend._id}`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true })
            .then(r => ({ user: friend.username, reviews: r.data || [] }))
        )).then(all => {
          const fr = {};
          all.forEach(({ user, reviews }) => { fr[user] = reviews; });
          setFriendReviews(fr);
        });
      })
      .catch(() => setFriends([]));
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181c24] via-[#232526] to-[#0a1833] text-white p-6 flex flex-col items-center relative">
      <div className="absolute top-4 left-4 z-50 select-none">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span className="text-lg font-extrabold tracking-tight font-playfair text-white px-4 py-1 rounded-full shadow-lg bg-[#1e0000a0] border border-[#ffd6c1] hover:bg-[#ffd6c133] transition-colors" style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.04em', textShadow: '0 2px 8px #2d0101' }}>
            visual.cineaste
          </span>
        </Link>
      </div>
      <h1 className="text-3xl font-extrabold mb-4 font-playfair tracking-tight text-cyan-300 drop-shadow-lg mt-8">Your Reviews</h1>
      {loading ? (
        <div className="text-gray-400 text-lg mt-10">Loading...</div>
      ) : myReviews.length === 0 ? (
        <div className="text-gray-400 text-lg mt-10">No reviews yet. Add reviews to your movies in your List!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-6xl">
          {myReviews.map(review => (
            <div key={review._id} className="bg-[#232526] rounded-2xl shadow-xl border border-cyan-900 p-4 flex flex-col items-center group relative overflow-hidden">
              <Link to={`/movie/${review.tmdbId}`} className="w-full flex flex-col items-center">
                <img src={review.poster || 'https://placehold.co/220x320?text=No+Image'} alt={review.title} className="w-40 h-60 object-cover rounded-xl mb-3 shadow-lg group-hover:scale-105 transition-transform duration-200 bg-gray-900" loading="lazy" />
                <div className="font-bold text-lg text-center text-cyan-200 mb-1 font-playfair">{review.title}</div>
              </Link>
              <div className="text-yellow-300 font-bold text-base mb-1">{review.rating !== undefined ? `★ ${review.rating}` : ''}</div>
              <div className="text-xs text-cyan-100 italic mb-2 text-center">{review.comment || review.review}</div>
              {/* Friends' reviews for this movie */}
              {friends.length > 0 && (
                <div className="mt-2 w-full">
                  {friends.map(friend => {
                    const fr = (friendReviews[friend] || []).find(m => m.id === movie.id);
                    return fr ? (
                      <div key={friend} className="bg-[#1e293b] rounded p-2 mt-1 text-xs text-cyan-200">
                        <span className="font-bold text-pink-300">{friend}:</span> {fr.notes}
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
