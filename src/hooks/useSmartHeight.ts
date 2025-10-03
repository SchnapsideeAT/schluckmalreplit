import { useState, useEffect } from 'react';

export const useSmartHeight = () => {
  const calculateSmartHeight = () => {
    const innerHeight = window.innerHeight;
    const screenHeight = window.screen.height;
    return Math.max(innerHeight, screenHeight);
  };

  const [height, setHeight] = useState(calculateSmartHeight());

  useEffect(() => {
    const updateHeight = () => {
      setHeight(calculateSmartHeight());
    };

    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);
    window.visualViewport?.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
      window.visualViewport?.removeEventListener('resize', updateHeight);
    };
  }, []);

  return height;
};
