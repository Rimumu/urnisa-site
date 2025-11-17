
import React, { useState, useEffect } from 'react';

interface CapybaraEasterEggProps {
  isVisible: boolean;
  onClose: () => void;
}

const ANIMATED_CAPY_URL = 'https://i.ibb.co/BKZX0KGm/Capy-NODDERS.gif';
const STATIC_CAPY_URL_1X = 'https://i.ibb.co/5y5dFhw/Capy-NODDERS.png'; // Original 256w
const STATIC_CAPY_URL_2X = 'https://i.ibb.co/529H3F8/Capy-NODDERS-512w.png'; // New 512w

const CapybaraEasterEgg: React.FC<CapybaraEasterEggProps> = ({ isVisible, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Preload the GIF to prevent flickering on the first click
  useEffect(() => {
    if (isVisible && !isLoaded) {
      const img = new Image();
      img.src = ANIMATED_CAPY_URL;
      img.onload = () => setIsLoaded(true);
    }
  }, [isVisible, isLoaded]);

  // Reset the component's state when it becomes hidden
  useEffect(() => {
    if (!isVisible) {
      // Add a small delay to allow the slide-out animation to complete before resetting the state.
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 700); // This duration should match the slide-out transition.
      return () => clearTimeout(timer);
    }
  }, [isVisible]);
  
  const handleClick = () => {
    if (!isAnimating) {
      // First click: start the animation if the GIF is loaded
      if (isLoaded) {
        setIsAnimating(true);
      }
    } else {
      // Second click: close the easter egg
      onClose();
    }
  };

  const commonImageClasses = 'w-full h-full absolute top-0 left-0 transition-opacity duration-500 ease-in-out';
  const altText = "A cute nodding capybara easter egg";

  return (
    <div
      className={`fixed bottom-0 right-5 z-[100] transition-transform duration-700 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      aria-hidden={!isVisible}
    >
      <div
        onClick={handleClick}
        className="relative w-48 h-48 cursor-pointer transition-transform duration-300 ease-out hover:scale-110"
        style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.4))' }}
        role="button"
        tabIndex={0}
        aria-label="Capybara easter egg"
      >
        {/* Static Image - visible by default, fades out on click */}
        <img
          loading="lazy"
          src={STATIC_CAPY_URL_1X}
          srcSet={`${STATIC_CAPY_URL_1X} 1x, ${STATIC_CAPY_URL_2X} 2x`}
          alt={altText}
          className={`${commonImageClasses} ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
        />
        {/* Animated GIF - hidden by default, fades in on click */}
        <img
          loading="lazy"
          // Only provide the src if the GIF is animating to ensure it loops correctly
          src={isAnimating ? ANIMATED_CAPY_URL : undefined}
          alt={altText}
          className={`${commonImageClasses} ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
    </div>
  );
};

export default CapybaraEasterEgg;