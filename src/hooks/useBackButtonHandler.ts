import { useEffect, useState } from 'react';

/**
 * Custom hook to handle mobile back button in popup components
 * Adds a history state when the popup opens and handles the popstate event
 * to close the popup when the back button is pressed
 * 
 * @param isOpen - Boolean indicating if the popup is open
 * @param onClose - Function to close the popup
 */
export function useBackButtonHandler(isOpen: boolean, onClose: () => void) {
  const [historyStateAdded, setHistoryStateAdded] = useState(false);

  // Add a history state when the popup opens
  useEffect(() => {
    if (isOpen && !historyStateAdded && typeof window !== 'undefined') {
      window.history.pushState({ popup: true }, "");
      setHistoryStateAdded(true);
    }
  }, [isOpen, historyStateAdded]);

  // Handle popstate event (back button)
  useEffect(() => {
    const handlePopState = () => {
      if (isOpen) {
        onClose();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', handlePopState);
      }
      
      // Clean up state when the popup is closed
      if (!isOpen && historyStateAdded) {
        setHistoryStateAdded(false);
      }
    };
  }, [isOpen, onClose, historyStateAdded]);
}
