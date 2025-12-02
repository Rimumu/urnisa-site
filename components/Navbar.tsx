
import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useTwitchStatus } from '../hooks/useTwitchStatus';

// Helper for Dropdown Logic
const NisathonDropdown: React.FC<{ closeMenu?: () => void }> = ({ closeMenu }) => (
    <div className="relative group">
        <NavLink 
            to="/nisathon" 
            className={({ isActive }) => `px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 transform flex items-center gap-1 ${isActive ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
            onClick={(e) => { if(window.innerWidth < 768) { e.preventDefault(); } }} // Prevent nav on click on mobile to allow dropdown to open if logic requires
        >
            <span>Nisathon</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </NavLink>
        
        {/* Dropdown Menu */}
        <div className="absolute left-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50">
            <div className="rounded-xl shadow-lg bg-brand-surface ring-1 ring-black ring-opacity-5 overflow-hidden border border-white/10">
                <NavLink 
                    to="/nisathon" 
                    end
                    onClick={closeMenu}
                    className={({ isActive }) => `block px-4 py-3 text-sm transition-colors ${isActive ? 'bg-brand-primary/20 text-brand-primary font-bold' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                >
                    Dashboard
                </NavLink>
                <NavLink 
                    to="/nisathon/wheel" 
                    onClick={closeMenu}
                    className={({ isActive }) => `block px-4 py-3 text-sm transition-colors ${isActive ? 'bg-brand-primary/20 text-brand-primary font-bold' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                >
                    Wheel
                </NavLink>
            </div>
        </div>
    </div>
);

// This component is now only for the desktop view.
const NavLinks: React.FC = () => (
    <>
        <NavLink to="/" className={({ isActive }) => `px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-105 ${isActive ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>Home</NavLink>
        <NisathonDropdown />
        <NavLink to="/minecraft" className={({ isActive }) => `px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-105 ${isActive ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>Minecraft</NavLink>
        <NavLink to="/about" className={({ isActive }) => `px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-105 ${isActive ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>About Me</NavLink>
    </>
);

interface NavbarProps {
    onEasterEggTrigger: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onEasterEggTrigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isLive = useTwitchStatus();

  // Easter Egg logic
  const pfpClickCount = useRef(0);
  const lastPfpClickTime = useRef(0);

  const handlePfpClick = () => {
    const now = Date.now();
    // Reset if clicks are more than 1 second apart to ensure they are "rapid"
    if (now - lastPfpClickTime.current > 1000) {
      pfpClickCount.current = 1;
    } else {
      pfpClickCount.current++;
    }
    lastPfpClickTime.current = now;

    if (pfpClickCount.current === 3) {
      onEasterEggTrigger();
      pfpClickCount.current = 0; // Reset after triggering
    }
  };

  // Lock body scroll when the mobile menu is open to improve user experience.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup function to reset scroll behavior on component unmount.
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // A helper function to close the menu, used by the navigation links.
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <nav className="bg-brand-secondary sticky top-0 z-50 shadow-lg shadow-black/30 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <NavLink to="/" onClick={handlePfpClick} className="flex items-center gap-3">
                <img
                  loading="lazy"
                  src="https://res.cloudinary.com/dsencimjn/image/upload/v1764629944/urnisapfp_irodss.png"
                  alt="Urnisa's profile picture"
                  className="w-9 h-9 rounded-full object-cover border-2 border-brand-primary/80"
                />
                <img 
                    src="https://res.cloudinary.com/dsencimjn/image/upload/v1764649926/Logo_File_urnisa_vfqvqe.png" 
                    alt="URNISA" 
                    className="h-8 md:h-12 w-auto object-contain"
                />
                <div
                  className={`w-3 h-3 rounded-full transition-colors ${
                    isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'
                  }`}
                  title={isLive ? 'Live' : 'Offline'}
                ></div>
              </NavLink>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLinks />
              </div>
            </div>
            {/* Mobile menu button (Hamburger/Close) */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-brand-surface focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded={isOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-menu"
        className={`
          md:hidden fixed inset-0 z-40 bg-brand-bg/95 backdrop-blur-sm
          transition-opacity duration-300 ease-in-out
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        aria-hidden={!isOpen}
      >
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <NavLink to="/" onClick={closeMenu} className={({ isActive }) => `text-3xl font-bold transition-colors duration-200 ${isActive ? 'text-brand-primary' : 'text-gray-300 hover:text-brand-primary'}`}>Home</NavLink>
            
            {/* Mobile Sub-menu for Nisathon */}
            <div className="flex flex-col space-y-4 bg-black/20 p-6 rounded-2xl w-3/4 max-w-sm border border-white/5">
                <span className="text-gray-400 uppercase text-xs font-bold tracking-widest mb-2">Nisathon Event</span>
                <NavLink to="/nisathon" onClick={closeMenu} end className={({ isActive }) => `text-2xl font-bold transition-colors duration-200 ${isActive ? 'text-brand-primary' : 'text-white hover:text-brand-primary'}`}>Dashboard</NavLink>
                <NavLink to="/nisathon/wheel" onClick={closeMenu} className={({ isActive }) => `text-2xl font-bold transition-colors duration-200 ${isActive ? 'text-brand-primary' : 'text-white hover:text-brand-primary'}`}>Wheel</NavLink>
            </div>

            <NavLink to="/minecraft" onClick={closeMenu} className={({ isActive }) => `text-3xl font-bold transition-colors duration-200 ${isActive ? 'text-brand-primary' : 'text-gray-300 hover:text-brand-primary'}`}>Minecraft</NavLink>
            <NavLink to="/about" onClick={closeMenu} className={({ isActive }) => `text-3xl font-bold transition-colors duration-200 ${isActive ? 'text-brand-primary' : 'text-gray-300 hover:text-brand-primary'}`}>About Me</NavLink>
        </div>
      </div>
    </>
  );
};

export default Navbar;
