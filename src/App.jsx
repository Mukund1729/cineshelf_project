import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MovieDetail from './pages/MovieDetail';
import TVDetail from './pages/TVDetail';
import { TrendingMovies } from './pages/TrendingMovies';
import PersonDetail from './pages/PersonDetail';
import PersonBoxOffice from './pages/PersonBoxOffice';
import FullFilmography from './pages/FullFilmography';
import GenrePage from './pages/GenrePage';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from '../src/ScrollToTop';
import PersonBoxOfficeSearchPage from './pages/PersonBoxOfficeSearchPage';
import CombinedBoxOfficePage from './pages/CombinedBoxOfficePage';
import BoxOfficeTabsPage from './pages/BoxOfficeTabsPage';
import ComparePage from './pages/ComparePage';
import CinematicPicks from './pages/CinematicPicks';
import Discover from './pages/Discover';
import Lists from './pages/Lists';
import Watchlist from './pages/Watchlist';
import Reviews from './pages/Reviews';
import People from './pages/People';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';

function AppWrapper() {
  return (
    <div className="app">
      <ScrollToTop />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/tv/:id" element={<TVDetail />} />
          <Route path="/trending" element={<TrendingMovies />} />
          <Route path="/person/:id" element={<PersonDetail />} />
          <Route path="/person/:id/boxoffice" element={<PersonBoxOffice />} />
          <Route path="/person-boxoffice" element={<PersonBoxOfficeSearchPage />} />
          <Route path="/boxoffice" element={<BoxOfficeTabsPage />} />
          <Route path="/person/:id/filmography" element={<FullFilmography />} />
          <Route path="/genre/:genreId/:genreName" element={<GenrePage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/cinematic-picks" element={<CinematicPicks />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/lists" element={<Lists />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/people" element={<People />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
}

export default AppWrapper;