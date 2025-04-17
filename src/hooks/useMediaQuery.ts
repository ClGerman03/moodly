import { useState, useEffect } from 'react';

/**
 * Custom hook to check if the current viewport matches a media query
 * @param query The media query to check against (e.g. '(max-width: 768px)')
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with false for server-side rendering
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create media query list
    const media = window.matchMedia(query);
    
    // Set the initial value
    setMatches(media.matches);
    
    // Define the listener function
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Definición de tipo para soportar ambas APIs de MediaQueryList
    const mql = media as MediaQueryList & {
      addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
      removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
    };
    
    // Add the event listener usando la API disponible
    if (mql.addEventListener) {
      mql.addEventListener('change', listener);
    } else if (mql.addListener) {
      mql.addListener(listener);
    }
    
    // Clean up function
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', listener);
      } else if (mql.removeListener) {
        mql.removeListener(listener);
      }
    };
    
    // Re-run if the query changes
  }, [query]);

  return matches;
}
