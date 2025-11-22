
import { useState, useEffect, useRef } from 'react';

/**
 * A custom hook to detect when an element is scrolled into the viewport.
 * It uses the Intersection Observer API for high performance.
 *
 * @template T - The type of the HTML element to be observed.
 * @returns {[React.RefObject<T>, boolean]} A tuple containing the ref to attach to the element
 * and a boolean state `isVisible` which is true when the element is in the viewport.
 */
export const useScrollAnimation = <T extends HTMLElement>(): [React.RefObject<T>, boolean] => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update state based on intersection status.
        // This allows the animation to reverse when scrolling out of view.
        setIsVisible(entry.isIntersecting);
      },
      {
        // Trigger the animation when the element is 15% visible
        threshold: 0.15,
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    // Cleanup function to unobserve the element when the component unmounts
    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);

  return [elementRef, isVisible];
};
