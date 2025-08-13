import React from 'react';
import logo from '../Screenshot 2025-06-22 175951.png';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-[#181818] via-[#232526] to-[#414345] border-b border-[#232526] px-6 py-3 flex justify-between items-center shadow-lg sticky top-0 z-50 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="relative h-20 w-20 flex items-center justify-center">
            <img src={logo} alt="visual.cineaste logo" className="h-20 w-20 rounded-full shadow-2xl border-4 border-cyan-400 bg-white object-cover" />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 font-semibold text-[0.65rem] text-white pointer-events-none select-none flex items-center justify-end px-2"
              style={{
                background: 'linear-gradient(90deg, #f7971e 0%, #ffd200 100%)',
                borderRadius: '9999px',
                padding: '0.10em 0.55em',
                fontSize: '0.7rem',
                boxShadow: '0 2px 6px 1px #ffd200, 0 0 3px #fff',
                letterSpacing: '0.03em',
                textShadow: '0 1px 2px #232526, 0 0 1px #fff',
                whiteSpace: 'nowrap',
                zIndex: 2,
                minWidth: '60px',
                maxWidth: '100px',
              }}
            >
              visual.cineaste
            </span>
          </div>
        </div>
      </div>
      <ul className="flex space-x-6 text-gray-200 text-base font-medium">
        <li>
          <Link to="/" className="hover:text-yellow-400 hover:underline underline-offset-8 cursor-pointer transition duration-200">Home</Link>
        </li>
        {/* <li>
          <Link to="/popular-movies" className="hover:text-pink-400 hover:underline underline-offset-8 cursor-pointer transition duration-200">Popular Movies</Link>
        </li> */}
        <li>
          <Link to="/trending-movies" className="hover:text-cyan-400 hover:underline underline-offset-8 cursor-pointer transition duration-200">Trending Movies</Link>
        </li>
        <li>
          <Link to="/popular-tv" className="hover:text-yellow-400 hover:underline underline-offset-8 cursor-pointer transition duration-200">Popular TV Shows</Link>
        </li>
        <li>
          <Link to="/popular-people" className="hover:text-pink-400 hover:underline underline-offset-8 cursor-pointer transition duration-200">Popular People</Link>
        </li>
        <li>
          <Link to="/tv" className="hover:text-cyan-400 hover:underline underline-offset-8 cursor-pointer transition duration-200">TV Shows</Link>
        </li>
        <li>
          <Link to="/reviews" className="hover:text-yellow-400 hover:underline underline-offset-8 cursor-pointer transition duration-200">Reviews</Link>
        </li>
        <li>
          <Link to="/about" className="hover:text-cyan-400 hover:underline underline-offset-8 cursor-pointer transition duration-200">About</Link>
        </li>
        <li>
          <Link to="/compare" className="hover:text-cyan-400 hover:underline underline-offset-8 cursor-pointer transition duration-200 font-bold">Compare</Link>
        </li>
        <li>
          <Link to="/lists" className="hover:text-yellow-400 hover:underline underline-offset-8 cursor-pointer transition duration-200">Lists</Link>
        </li>
        <li>
          <Link to="/cinematic-picks" className="hover:text-pink-400 hover:underline underline-offset-8 cursor-pointer transition duration-200 font-bold">Cinematic Picks</Link>
        </li>
        <li>
          <Link to="/discover" className="hover:text-cyan-400 hover:underline underline-offset-8 cursor-pointer transition duration-200 font-bold">Discover</Link>
        </li>
        <li>
          <Link to="/watchlist" className="hover:text-cyan-400 hover:underline underline-offset-8 cursor-pointer transition duration-200">Watchlist</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;