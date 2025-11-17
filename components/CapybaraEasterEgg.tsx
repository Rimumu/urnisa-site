
import React, { useState, useEffect } from 'react';

interface CapybaraEasterEggProps {
  isVisible: boolean;
  onClose: () => void;
}

// The new animated GIF provided by the user.
const ANIMATED_CAPY_URL = 'https://i.ibb.co/BKZX0KGm/Capy-NODDERS.gif';
// The previous static image will serve as the "paused" first frame.
const STATIC_CAPY_URL = 'https://i.ibb.co.com/5y5dFhw/Capy-NODDERS.png';

const CapybaraEasterEgg: React.FC<CapybaraEasterEggProps> = ({ isVisible, onClose }) => {
  const [isClicked, setIsClicked] = useState(false);

  // Reset the component's state when it becomes hidden, so it's fresh for the next trigger.
  useEffect(() => {
    if (!isVisible) {
      // Add a small delay to allow the slide-out animation to complete before resetting the state.
      const timer = setTimeout(() => {
        setIsClicked(false);
      }, 700); // This duration should match the slide-out transition.
      return () => clearTimeout(timer);
    }
  }, [isVisible]);
  
  const handleClick = () => {
    // Prevent re-triggering the animation if it's already playing.
    if (isClicked) return;

    // Trigger the animation by setting the clicked state to true.
    setIsClicked(true);

    // Set a timer to close the component after the GIF has had time to play.
    // The nodding GIF animation is roughly 2.5 seconds long.
    setTimeout(() => {
      onClose();
    }, 2500); 
  };
  
  // Use a unique key for the image. This forces the browser to re-render the <img> tag
  // and play the GIF from the beginning each time, rather than showing a cached, static frame.
  const imageSrc = isClicked ? `${ANIMATED_CAPY_URL}?t=${new Date().getTime()}` : STATIC_CAPY_URL;
  const altText = isClicked ? "A cute nodding capybara" : "A cute capybara with a small orange on its head";

  return (
    <div
      className={`fixed bottom-0 right-5 z-[100] transition-transform duration-700 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      aria-hidden={!isVisible}
    >
      <img
        key={imageSrc} // Force re-render on src change
        src={imageSrc}
        alt={altText}
        onClick={handleClick}
        className={'w-48 h-auto cursor-pointer transition-transform duration-300 ease-out hover:scale-110'}
        style={{
          filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.4))'
        }}
      />
    </div>
  );
};

export default CapybaraEasterEgg;
