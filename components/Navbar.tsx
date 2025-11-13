import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTwitchStatus } from '../hooks/useTwitchStatus';

// This component is now only for the desktop view.
const NavLinks: React.FC = () => (
    <>
        <NavLink to="/" className={({ isActive }) => `px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-105 ${isActive ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>Home</NavLink>
        <NavLink to="/subathon" className={({ isActive }) => `px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-105 ${isActive ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>Subathon</NavLink>
        <NavLink to="/minecraft" className={({ isActive }) => `px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-105 ${isActive ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>Minecraft</NavLink>
        <NavLink to="/about" className={({ isActive }) => `px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-105 ${isActive ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>About Me</NavLink>
    </>
);

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isLive = useTwitchStatus();

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
      <nav className="bg-black/30 backdrop-blur-lg sticky top-0 z-50 shadow-lg shadow-black/30 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <NavLink to="/" className="text-white font-extrabold text-xl tracking-wider flex items-center gap-3">
                <img 
                  src="https://i.ibb.co.com/XZnspyRV/b7587fee-97a4-4c4b-a046-b7ae4ec6650c-profile-image-70x70.png" 
                  alt="Urnisa's profile picture" 
                  className="w-9 h-9 rounded-full object-cover border-2 border-brand-primary/80" 
                />
                <span>
                  URNISA
                </span>
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
          md:hidden fixed inset-0 z-40 bg-brand-bg/95 backdrop-blur-xl
          transition-opacity duration-300 ease-in-out
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        aria-hidden={!isOpen}
      >
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <NavLink to="/" onClick={closeMenu} className={({ isActive }) => `text-3xl font-bold transition-colors duration-200 ${isActive ? 'text-brand-primary' : 'text-gray-300 hover:text-brand-primary'}`}>Home</NavLink>
            <NavLink to="/subathon" onClick={closeMenu} className={({ isActive }) => `text-3xl font-bold transition-colors duration-200 ${isActive ? 'text-brand-primary' : 'text-gray-300 hover:text-brand-primary'}`}>Subathon</NavLink>
            <NavLink to="/minecraft" onClick={closeMenu} className={({ isActive }) => `text-3xl font-bold transition-colors duration-200 ${isActive ? 'text-brand-primary' : 'text-gray-300 hover:text-brand-primary'}`}>Minecraft</NavLink>
            <NavLink to="/about" onClick={closeMenu} className={({ isActive }) => `text-3xl font-bold transition-colors duration-200 ${isActive ? 'text-brand-primary' : 'text-gray-300 hover:text-brand-primary'}`}>About Me</NavLink>
        </div>
      </div>
    </>
  );
};

export default Navbar;