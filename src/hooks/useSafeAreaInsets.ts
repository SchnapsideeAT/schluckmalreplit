import { useState, useEffect } from 'react';

interface SafeAreaInsets {
  top: string;
  bottom: string;
  left: string;
  right: string;
}

const DEFAULT_INSETS: SafeAreaInsets = {
  top: '1rem',
  bottom: '1rem',
  left: '1rem',
  right: '1rem',
};

export const useSafeAreaInsets = () => {
  const [insets, setInsets] = useState<SafeAreaInsets>(DEFAULT_INSETS);

  useEffect(() => {
    const calculateInsets = () => {
      // Try to get CSS env() values first
      const testDiv = document.createElement('div');
      testDiv.style.position = 'fixed';
      testDiv.style.top = '0';
      testDiv.style.left = '0';
      testDiv.style.width = '1px';
      testDiv.style.height = '1px';
      testDiv.style.paddingTop = 'env(safe-area-inset-top, 0px)';
      testDiv.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)';
      testDiv.style.paddingLeft = 'env(safe-area-inset-left, 0px)';
      testDiv.style.paddingRight = 'env(safe-area-inset-right, 0px)';
      testDiv.style.visibility = 'hidden';
      document.body.appendChild(testDiv);

      const computed = getComputedStyle(testDiv);
      const cssTop = computed.paddingTop;
      const cssBottom = computed.paddingBottom;
      const cssLeft = computed.paddingLeft;
      const cssRight = computed.paddingRight;

      document.body.removeChild(testDiv);

      // Check if CSS env() values are valid (not '0px')
      const hasCSSValues = 
        cssTop !== '0px' && 
        cssBottom !== '0px' && 
        cssTop !== '' && 
        cssBottom !== '';

      if (hasCSSValues) {
        // Use CSS values
        setInsets({
          top: `max(1rem, ${cssTop})`,
          bottom: `max(1rem, ${cssBottom})`,
          left: `max(1rem, ${cssLeft})`,
          right: `max(1rem, ${cssRight})`,
        });
        return;
      }

      // Fallback: Calculate based on viewport differences
      // On iOS, if the page doesn't fill the full screen, there's a safe area
      const windowHeight = window.innerHeight;
      const screenHeight = window.screen.height;
      const windowWidth = window.innerWidth;
      const screenWidth = window.screen.width;

      // Estimate safe areas based on device characteristics
      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
      const hasNotch = isIOS && (screenHeight >= 812 || screenWidth >= 812); // iPhone X and newer

      let topInset = '1rem';
      let bottomInset = '1rem';

      if (hasNotch) {
        // iPhone X and newer have notch/dynamic island and home indicator
        // Top notch area: ~44px in portrait, ~32px in landscape
        // Bottom home indicator: ~34px in portrait, ~21px in landscape
        const isPortrait = windowHeight > windowWidth;
        
        if (isPortrait) {
          topInset = 'max(1rem, 44px)';
          bottomInset = 'max(1rem, 34px)';
        } else {
          topInset = 'max(1rem, 32px)';
          bottomInset = 'max(1rem, 21px)';
        }
      } else if (isIOS) {
        // Older iPhones without notch
        topInset = 'max(1rem, 20px)'; // Status bar
        bottomInset = '1rem';
      }

      setInsets({
        top: topInset,
        bottom: bottomInset,
        left: '1rem',
        right: '1rem',
      });
    };

    // Initial calculation
    calculateInsets();

    // Recalculate on resize and orientation change
    window.addEventListener('resize', calculateInsets);
    window.addEventListener('orientationchange', calculateInsets);

    return () => {
      window.removeEventListener('resize', calculateInsets);
      window.removeEventListener('orientationchange', calculateInsets);
    };
  }, []);

  return insets;
};
