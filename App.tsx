
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Subathon from './pages/Subathon';
import Wheel from './pages/Wheel';
import Minecraft from './pages/Minecraft';
import About from './pages/About';
import Admin from './pages/Admin';
import Overlay from './pages/Overlay';
import InteractiveBackground from './components/InteractiveBackground';
import CapybaraEasterEgg from './components/CapybaraEasterEgg';
import ScrollToTopButton from './components/ScrollToTopButton';

const App: React.FC = () => {
  const [showCapybara, setShowCapybara] = useState(false);
  
  const triggerEasterEgg = () => {
    setShowCapybara(true);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Routes>
        <Route path="/overlay" element={<Overlay />} />
        <Route path="*" element={
          <>
            <InteractiveBackground />
            <Navbar onEasterEggTrigger={triggerEasterEgg} />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/nisathon" element={<Subathon />} />
                <Route path="/nisathon/wheel" element={<Wheel />} />
                <Route path="/minecraft" element={<Minecraft />} />
                <Route path="/about" element={<About />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </main>
            <Footer />
            <ScrollToTopButton />
            <CapybaraEasterEgg 
              isVisible={showCapybara}
              onClose={() => setShowCapybara(false)}
            />
          </>
        } />
      </Routes>
    </div>
  );
};

export default App;
