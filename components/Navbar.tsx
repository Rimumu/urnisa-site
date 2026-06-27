
import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useTwitchStatus } from '../hooks/useTwitchStatus';

// Helper for Dropdown Logic
const EventsDropdown: React.FC<{ closeMenu?: () => void }> = ({ closeMenu }) => (
  <div className="relative group">
    <NavLink
      to="/nisathon"
      className={({ isActive }) => `px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-105 flex items-center gap-1 ${isActive ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
      onClick={(e) => { if (window.innerWidth < 768) { e.preventDefault(); } }} // Prevent nav on click on mobile to allow dropdown to open if logic requires
    >
      <span>Events</span>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </NavLink>

    {/* Dropdown Menu */}
    <div className="absolute left-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50">
      <div className="rounded-xl shadow-lg bg-brand-surface ring-1 ring-black ring-opacity-5 overflow-hidden border border-white/10">
        <NavLink
          to="/snakesladder"
          onClick={closeMenu}
          className={({ isActive }) => `block px-4 py-3 text-sm transition-colors ${isActive ? 'bg-brand-primary/20 text-brand-primary font-bold' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
        >
          S & L
        </NavLink>
      </div>
    </div>
  </div>
);

const MinecraftDropdown: React.FC<{ closeMenu?: () => void }> = ({ closeMenu }) => (
  <div className="relative group">
    <NavLink
      to="/minecraft"
      className={({ isActive }) => `px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-105 flex items-center gap-1 ${isActive ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
      onClick={(e) => { if (window.innerWidth < 768) { e.preventDefault(); } }}
    >
      <span>Minecraft</span>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </NavLink>

    {/* Dropdown Menu */}
    <div className="absolute left-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50">
      <div className="rounded-xl shadow-lg bg-brand-surface ring-1 ring-black ring-opacity-5 overflow-hidden border border-white/10">
        <NavLink
          to="/minecraft"
          end
          onClick={closeMenu}
          className={({ isActive }) => `block px-4 py-3 text-sm transition-colors ${isActive ? 'bg-brand-primary/20 text-brand-primary font-bold' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
        >
          Dashboard
        </NavLink>
      </div>
    </div>
  </div>
);

// This component is now only for the desktop view.
const NavLinks: React.FC = () => (
  <>
    <NavLink to="/" className={({ isActive }) => `flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-105 ${isActive ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>Home</NavLink>
    <EventsDropdown />
    <MinecraftDropdown />
    <NavLink to="/gallery" className={({ isActive }) => `flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-105 ${isActive ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>Art Gallery</NavLink>
    <NavLink to="/archive" className={({ isActive }) => `flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-105 ${isActive ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>Archive</NavLink>
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

  const handleLogoClick = () => {
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
      <nav className="bg-brand-secondary sticky top-0 z-[100] shadow-lg shadow-black/30 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {/* Logo Link to Twitch with PFP and Text */}
              <a
                href="https://twitch.tv/urnisa_"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLogoClick}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
              >
                <img
                  src="https://res.cloudinary.com/dsencimjn/image/upload/v1764677430/urnisapfp2_l3a3xx.png"
                  alt="Urnisa"
                  className="h-10 w-10 rounded-full object-cover border-2 border-brand-primary/50 group-hover:border-brand-primary transition-colors"
                />
                <span className="text-white font-black text-xl tracking-widest">URNISA</span>
              </a>

              {/* Live Status Indicator */}
              <a
                href="https://twitch.tv/urnisa_"
                target="_blank"
                rel="noopener noreferrer"
                className={`
                    px-2 py-1 rounded-md text-[10px] font-black tracking-widest uppercase text-white transition-all duration-300
                    ${isLive
                    ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)] animate-pulse'
                    : 'bg-gray-600 opacity-80'
                  }
                `}
                title={isLive ? 'Urnisa is LIVE!' : 'Urnisa is Offline'}
              >
                {isLive ? 'LIVE' : 'OFFLINE'}
              </a>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-center gap-2">
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
          md:hidden fixed inset-0 z-[90] bg-brand-bg/98 backdrop-blur-2xl
          transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] pt-16
          ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 pointer-events-none'}
        `}
        aria-hidden={!isOpen}
      >
        <div className="flex flex-col px-8 py-8 h-full overflow-y-auto space-y-8 custom-scrollbar">
          <NavLink to="/" onClick={closeMenu} className={({ isActive }) => `text-3xl font-extrabold tracking-tight transition-colors duration-200 ${isActive ? 'text-brand-primary' : 'text-white hover:text-brand-primary'}`}>Home</NavLink>

          {/* Mobile Sub-menu for Events */}
          <div className="flex flex-col space-y-3">
            <span className="text-gray-500 uppercase text-xs font-bold tracking-widest">Events</span>
            <div className="flex flex-col space-y-4 pl-4 border-l-2 border-white/10">
              <NavLink to="/snakesladder" onClick={closeMenu} className={({ isActive }) => `text-xl font-bold transition-all duration-200 ${isActive ? 'text-brand-primary translate-x-1' : 'text-gray-300 hover:text-white hover:translate-x-1'}`}>S & L</NavLink>
            </div>
          </div>

          {/* Mobile Sub-menu for Minecraft */}
          <div className="flex flex-col space-y-3">
            <span className="text-gray-500 uppercase text-xs font-bold tracking-widest">Minecraft</span>
            <div className="flex flex-col space-y-4 pl-4 border-l-2 border-white/10">
              <NavLink to="/minecraft" onClick={closeMenu} end className={({ isActive }) => `text-xl font-bold transition-all duration-200 ${isActive ? 'text-brand-primary translate-x-1' : 'text-gray-300 hover:text-white hover:translate-x-1'}`}>Dashboard</NavLink>
            </div>
          </div>

          <NavLink to="/gallery" onClick={closeMenu} className={({ isActive }) => `text-3xl font-extrabold tracking-tight transition-colors duration-200 ${isActive ? 'text-brand-primary' : 'text-white hover:text-brand-primary'}`}>Art Gallery</NavLink>
          <NavLink to="/archive" onClick={closeMenu} className={({ isActive }) => `text-3xl font-extrabold tracking-tight transition-colors duration-200 ${isActive ? 'text-brand-primary' : 'text-white hover:text-brand-primary'}`}>Archive</NavLink>
        </div>
      </div>
    </>
  );
};

export default Navbar;