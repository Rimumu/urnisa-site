
import React, { useState } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Subathon from './pages/Subathon';
import Wheel from './pages/Wheel';
import Minecraft from './pages/Minecraft';
import Gacha from './pages/Gacha';
import GachaDev from './pages/GachaDev'; // Import Dev Page
import TournamentDev from './pages/TournamentDev'; // New Import
import Tournament from './pages/Tournament'; // Prod Tournament Page
import AdminTournamentDev from './pages/AdminTournamentDev'; // New Admin Tournament Dev Page
import AdminTournament from './pages/AdminTournament'; // New Admin Tournament Production Page
import Bingo from './pages/Bingo';
import BingoDashboard from './pages/BingoDashboard';
import Inventory from './pages/Inventory';
import Redeem from './pages/Redeem';
import About from './pages/About';
import Admin from './pages/Admin';
import Rankings from './pages/Rankings';
import Overlay from './pages/Overlay';
import TimerWidget from './pages/overlays/TimerWidget';
import GoalWidget from './pages/overlays/GoalWidget';
import ActivityWidget from './pages/overlays/ActivityWidget';
import SpinWidget from './pages/overlays/SpinWidget';
import CountdownWidget from './pages/overlays/CountdownWidget';
import InteractiveBackground from './components/InteractiveBackground';
import CapybaraEasterEgg from './components/CapybaraEasterEgg';
import ScrollToTopButton from './components/ScrollToTopButton';
import ScrollToTop from './components/ScrollToTop';

// Main Layout Wrapper
// Handles the persistent UI elements (Navbar, Footer, Background)
const MainLayout: React.FC = () => {
  const [showCapybara, setShowCapybara] = useState(false);
  const location = useLocation();

  const triggerEasterEgg = () => {
    setShowCapybara(true);
  };

  return (
    <>
      <ScrollToTop />
      <InteractiveBackground />
      <Navbar onEasterEggTrigger={triggerEasterEgg} />
      <main key={location.pathname} className="flex-grow container mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Outlet /> {/* This is where child routes (Home, Admin, etc) render */}
      </main>
      <Footer />
      <ScrollToTopButton />
      <CapybaraEasterEgg
        isVisible={showCapybara}
        onClose={() => setShowCapybara(false)}
      />
    </>
  );
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Routes>
        {/* 1. STANDALONE OVERLAY ROUTES (No Navbar/Footer) */}
        <Route path="/overlay" element={<Overlay />} />
        <Route path="/overlay/timer" element={<TimerWidget />} />
        <Route path="/overlay/goal" element={<GoalWidget />} />
        <Route path="/overlay/activity" element={<ActivityWidget />} />
        <Route path="/overlay/spin" element={<SpinWidget />} />
        <Route path="/overlay/countdown" element={<CountdownWidget />} />

        {/* 2. MAIN WEBSITE ROUTES (Wrapped in Layout) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/nisathon" element={<Subathon />} />
          <Route path="/nisathon/wheel" element={<Wheel />} />
          <Route path="/minecraft" element={<Minecraft />} />
          <Route path="/minecraft/gacha" element={<Gacha />} />
          <Route path="/minecraft/tournament" element={<Tournament />} />
          <Route path="/minecraft/rankings" element={<Rankings />} />
          {/* Dev Routes */}
          <Route path="/dev/gacha" element={<GachaDev />} />
          <Route path="/dev/tournament" element={<TournamentDev />} />
          <Route path="/dev/admintournament" element={<AdminTournamentDev />} />
          {/* Prod Admin Routes */}
          <Route path="/admin/tournament" element={<AdminTournament />} />

          <Route path="/minecraft/bingo" element={<BingoDashboard />} />
          <Route path="/minecraft/bingo/card" element={<Bingo />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/redeem" element={<Redeem />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<Admin />} />

          {/* 404 Fallback - Redirects unknown paths to Home */}
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
