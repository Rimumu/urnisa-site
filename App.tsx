
import React, { useState } from 'react';
import { Routes, Route, Outlet, useLocation, useOutlet, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Nisathon from './pages/Nisathon';
import Wheel from './pages/Wheel';
import Minecraft from './pages/Minecraft';
import MinecraftTeaser from './pages/MinecraftTeaser';
import Rankings from './pages/Rankings';
import Archive from './pages/Archive';
import ArchiveNisathon from './pages/ArchiveNisathon';
import ArchiveWheel from './pages/ArchiveWheel';
import ArchiveTournament from './pages/ArchiveTournament';
import Gacha from './pages/Gacha';
import GachaDev from './pages/GachaDev'; // Import Dev Page
import TournamentDev from './pages/TournamentDev'; // New Import
import Tournament from './pages/Tournament'; // Prod Tournament Page
import AdminTournamentDev from './pages/AdminTournamentDev'; // New Admin Tournament Dev Page
import AdminTournament from './pages/AdminTournament'; // New Admin Tournament Production Page
import SnakesLadder from './pages/SnakesLadder'; // Snakes and Ladders Game
import Bingo from './pages/Bingo';
import BingoDashboard from './pages/BingoDashboard';
import Inventory from './pages/Inventory';
import Redeem from './pages/Redeem';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Admin from './pages/Admin';
import Overlay from './pages/Overlay';
import TimerWidget from './pages/overlays/TimerWidget';
import GoalWidget from './pages/overlays/GoalWidget';
import ActivityWidget from './pages/overlays/ActivityWidget';
import SpinWidget from './pages/overlays/SpinWidget';
import CountdownWidget from './pages/overlays/CountdownWidget';
import DuoCard from './pages/DuoCard';
import InteractiveBackground from './components/InteractiveBackground';
import CapybaraEasterEgg from './components/CapybaraEasterEgg';
import ScrollToTopButton from './components/ScrollToTopButton';
import ScrollToTop from './components/ScrollToTop';

// Main Layout Wrapper
// Handles the persistent UI elements (Navbar, Footer, Background)
const MainLayout: React.FC = () => {
  const [showCapybara, setShowCapybara] = useState(false);
  const location = useLocation();
  const currentOutlet = useOutlet();

  const triggerEasterEgg = () => {
    setShowCapybara(true);
  };

  return (
    <>
      <ScrollToTop />
      <InteractiveBackground />
      <Navbar onEasterEggTrigger={triggerEasterEgg} />
      <AnimatePresence mode="wait">
        <motion.main 
          key={location.pathname} 
          className="flex-grow container mx-auto px-4 py-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {currentOutlet}
        </motion.main>
      </AnimatePresence>
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
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden">
      <Routes>
        {/* 1. STANDALONE OVERLAY ROUTES (No Navbar/Footer) */}
        <Route path="/overlay" element={<Overlay />} />
        <Route path="/overlay/timer" element={<TimerWidget />} />
        <Route path="/overlay/goal" element={<GoalWidget />} />
        <Route path="/overlay/activity" element={<ActivityWidget />} />
        <Route path="/overlay/spin" element={<SpinWidget />} />
        <Route path="/overlay/countdown" element={<CountdownWidget />} />
        <Route path="/duo-card" element={<DuoCard />} />
        <Route path="/admin" element={<Admin />} />

        {/* 2. MAIN WEBSITE ROUTES (Wrapped in Layout) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<About />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/nisathon" element={<Nisathon />} />
          <Route path="/nisathon/wheel" element={<Wheel />} />
          <Route path="/snakesladder" element={<SnakesLadder />} />
          <Route path="/minecraftBACK" element={<Minecraft />} />
          <Route path="/minecraft" element={<MinecraftTeaser />} />
          <Route path="/minecraft/gachaBACK" element={<Gacha />} />
          <Route path="/minecraft/rankingsBACK" element={<Rankings />} />
          <Route path="/minecraft/tournamentBACK" element={<Tournament />} />
          {/* Dev Routes */}
          <Route path="/dev/gacha" element={<GachaDev />} />
          <Route path="/dev/tournament" element={<TournamentDev />} />
          <Route path="/dev/admintournament" element={<AdminTournamentDev />} />
          <Route path="/dev/snakesladder" element={<SnakesLadder />} />
          {/* Prod Admin Routes */}
          <Route path="/admin/tournament" element={<AdminTournament />} />

          <Route path="/minecraft/bingoBACK" element={<BingoDashboard />} />
          <Route path="/minecraft/bingo/cardBACK" element={<Bingo />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/redeem" element={<Redeem />} />
          <Route path="/about" element={<Navigate to="/" replace />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/archive/nisathon" element={<ArchiveNisathon />} />
          <Route path="/archive/wheel" element={<ArchiveWheel />} />
          <Route path="/archive/tournament" element={<ArchiveTournament />} />

          {/* 404 Fallback - Redirects unknown paths to Home */}
          <Route path="*" element={<About />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
