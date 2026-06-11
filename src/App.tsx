/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './components/Home';
import Showroom from './components/Showroom';
import VehicleDetails from './components/VehicleDetails';
import Loans from './components/Loans';
import LogbookLoans from './components/LogbookLoans';
import LandTitleLoans from './components/LandTitleLoans';
import Apply from './components/Apply';
import About from './components/About';
import Testimonials from './components/Testimonials';
import Blog from './components/Blog';
import Contact from './components/Contact';
import Admin from './components/Admin';
import Pitch from './components/Pitch';
import PitchReturn from './components/PitchReturn';

// React Router preserves scroll position during client-side navigation. The
// public site should feel like separate pages, so each route starts at the top.
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

/**
 * Application shell.
 *
 * All current routes share the same navigation and footer. Planned production
 * routes include `/cars`, `/apply`, `/contact`, `/about`, and admin paths.
 */
export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <PitchReturn />
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cars" element={<Showroom />} />
            <Route path="/cars/:slug" element={<VehicleDetails />} />
            <Route path="/showroom" element={<Navigate to="/cars" replace />} />
            <Route path="/showroom/:id" element={<VehicleDetails />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/logbook-loans" element={<LogbookLoans />} />
            <Route path="/land-title-loans" element={<LandTitleLoans />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/about" element={<About />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pitch" element={<Pitch />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
