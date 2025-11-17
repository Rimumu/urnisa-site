import { useEffect, useState, useCallback } from 'react';

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 
  'b', 'a'
];

/**
 * A custom hook to detect when the user enters the Konami code.
 * 
 * @param {() => void} callback The function to execute when the code is successfully entered.
 */
export const useKonamiCode = (callback: () => void) => {
  const [keySequence, setKeySequence] = useState<string[]>([]);

  const onKeyDown = useCallback((event: KeyboardEvent) => {
    setKeySequence((currentSequence) => {
      const newSequence = [...currentSequence, event.key.toLowerCase()];
      
      // If the current sequence doesn't match the start of the Konami code, reset it.
      if (KONAMI_CODE[newSequence.length - 1] !== newSequence[newSequence.length - 1]) {
        return [];
      }

      // If the sequence matches the Konami code
      if (newSequence.join('') === KONAMI_CODE.join('')) {
        callback();
        return []; // Reset after successful entry
      }

      return newSequence;
    });
  }, [callback]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);
};
