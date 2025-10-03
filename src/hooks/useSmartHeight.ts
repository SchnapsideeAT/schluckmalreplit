import { useState, useEffect, useRef } from 'react';

export const useSmartHeight = () => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  const calculateInitialHeight = () => {
    return window.innerHeight;
  };

  const [height, setHeight] = useState(calculateInitialHeight());
  const baselineHeightRef = useRef(window.innerHeight);

  useEffect(() => {
    const updateHeight = () => {
      const currentInnerHeight = window.innerHeight;
      const screenHeight = window.screen.height;

      if (!isIOS) {
        setHeight(currentInnerHeight);
        return;
      }

      if (currentInnerHeight > baselineHeightRef.current) {
        baselineHeightRef.current = currentInnerHeight;
      }

      const heightDifference = baselineHeightRef.current - currentInnerHeight;
      const isSuspiciouslyShrunk = heightDifference > 50;

      if (isSuspiciouslyShrunk && currentInnerHeight < screenHeight) {
        setHeight(screenHeight);
      } else {
        setHeight(currentInnerHeight);
      }
    };

    const onResize = () => {
      updateHeight();
    };

    const onOrientationChange = () => {
      setTimeout(() => {
        baselineHeightRef.current = window.innerHeight;
        updateHeight();
      }, 300);
    };

    const onVisualViewportResize = () => {
      updateHeight();
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onOrientationChange);
    window.visualViewport?.addEventListener('resize', onVisualViewportResize);

    updateHeight();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onOrientationChange);
      window.visualViewport?.removeEventListener('resize', onVisualViewportResize);
    };
  }, [isIOS]);

  return height;
};
