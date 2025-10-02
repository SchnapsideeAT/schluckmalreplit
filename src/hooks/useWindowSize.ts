import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

export const useWindowSize = () => {
  const getSize = () => {
    // Use #root element's actual size (accounts for safe area insets)
    const rootElement = document.getElementById('root');
    
    if (rootElement) {
      return {
        width: rootElement.clientWidth,
        height: rootElement.clientHeight,
      };
    }
    
    // Fallback to window.innerWidth/Height
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  };

  const [windowSize, setWindowSize] = useState<WindowSize>(getSize());

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce resize events for better performance
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize(getSize());
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
};
