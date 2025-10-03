import { useEffect } from 'react';

export const useIOSKeyboardFix = () => {
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (!isIOS) {
      return;
    }

    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        const currentScrollY = window.scrollY;
        
        setTimeout(() => {
          window.scrollTo(0, 0);
          
          setTimeout(() => {
            window.scrollTo(0, currentScrollY);
          }, 10);
        }, 300);
      }
    };

    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);
};
