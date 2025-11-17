
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Subathon from './pages/Subathon';
import Minecraft from './pages/Minecraft';
import About from './pages/About';
import InteractiveBackground from './components/InteractiveBackground';
import { useKonamiCode } from './hooks/useKonamiCode';
import CapybaraEasterEgg from './components/CapybaraEasterEgg';

const App: React.FC = () => {
  const [showCapybara, setShowCapybara] = useState(false);
  
  // When the Konami code is entered, show the capybara!
  useKonamiCode(() => {
    setShowCapybara(true);
  });

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <InteractiveBackground />
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/subathon" element={<Subathon />} />
          <Route path="/minecraft" element={<Minecraft />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <Footer />
      <CapybaraEasterEgg 
        isVisible={showCapybara}
        onClose={() => setShowCapybara(false)}
      />
    </div>
  );
};

export default App;