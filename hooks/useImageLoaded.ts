
import { useState, useEffect } from 'react';

/**
 * A custom hook to track the loading status of an image.
 * This helps in creating progressive loading effects like placeholders.
 * @param {string} src The source URL of the image to track.
 * @returns {boolean} A boolean that is true once the image has successfully loaded.
 */
export const useImageLoaded = (src: string): boolean => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // If there's no src, we can't load anything.
    if (!src) {
      return;
    }

    let isMounted = true;
    const img = new Image();
    img.src = src;

    const handleLoad = () => {
      if (isMounted) {
        setIsLoaded(true);
      }
    };

    // If the image is already in the browser cache, it might be 'complete' immediately.
    if (img.complete) {
      handleLoad();
    } else {
      img.addEventListener('load', handleLoad);
    }
    
    // Cleanup function to avoid setting state on an unmounted component.
    return () => {
      isMounted = false;
      img.removeEventListener('load', handleLoad);
    };
  }, [src]);

  return isLoaded;
};
