import { useEffect } from 'react';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';

export const useKeyboardFix = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let isMounted = true;
    let listenerHandle: any = null;

    const handleKeyboardDidHide = () => {
      if (!isMounted) return;
      
      window.scrollTo(0, 0);
      
      setTimeout(() => {
        if (isMounted) {
          window.dispatchEvent(new Event('resize'));
        }
      }, 100);
    };

    const setupListener = async () => {
      try {
        const handle = await Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);
        
        if (isMounted) {
          listenerHandle = handle;
        } else {
          handle.remove();
        }
      } catch (error) {
        console.error('Failed to setup keyboard listener:', error);
      }
    };

    setupListener();

    return () => {
      isMounted = false;
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, []);
};
