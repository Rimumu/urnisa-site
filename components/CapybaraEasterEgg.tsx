
import React, { useState, useEffect } from 'react';

interface CapybaraEasterEggProps {
  isVisible: boolean;
  onClose: () => void;
}

const CapybaraEasterEgg: React.FC<CapybaraEasterEggProps> = ({ isVisible, onClose }) => {
  const [isHopping, setIsHopping] = useState(false);

  // Automatically close the Easter egg after 10 seconds if it's visible and not interacted with.
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);
  
  const handleClick = () => {
    // Trigger the hop animation.
    setIsHopping(true);
    // After the hop animation duration, trigger the close action.
    setTimeout(() => {
      onClose();
      // Reset the hop state for the next time it appears.
      setIsHopping(false);
    }, 300); 
  };

  return (
    <div
      className={`fixed bottom-0 right-5 z-[100] transition-transform duration-700 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      aria-hidden={!isVisible}
    >
      <img
        src="https://i.ibb.co/L67BwB2/capy.png"
        alt="A cute capybara with a small orange on its head"
        onClick={handleClick}
        className={`w-48 h-auto cursor-pointer transition-transform duration-300 ease-out hover:scale-110 ${
          isHopping ? '-translate-y-5' : 'translate-y-0'
        }`}
        style={{
          filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.4))'
        }}
      />
    </div>
  );
};

export default CapybaraEasterEgg;
