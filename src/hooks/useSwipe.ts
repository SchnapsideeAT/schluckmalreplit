import { useRef, useState, useEffect, useCallback } from "react";
import { triggerHaptic, type HapticType } from "@/utils/haptics";

/**
 * useSwipe Hook (v2 - Optimized)
 * 
 * Complete rewrite with:
 * - Unified horizontal distance calculation for glow effects
 * - Separate absolute distance for threshold checks
 * - Better RAF cleanup and state reset
 * - Touch and mouse support with unified logic
 * - Haptic feedback on swipe completion
 * 
 * @param handlers - Callbacks for swipe events
 * @returns Swipe state and event handlers
 */

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

interface SwipeState {
  isSwiping: boolean;
  swipeDirection: 'left' | 'right' | 'up' | null;
  horizontalDistance: number;    // Always X-axis for glow calculation
  absoluteDistance: number;      // Absolute value for threshold checks
}

export const useSwipe = (handlers: SwipeHandlers) => {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    isSwiping: false,
    swipeDirection: null,
    horizontalDistance: 0,
    absoluteDistance: 0,
  });

  const touchStartX = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);
  const isMouseDown = useRef<boolean>(false);
  const rafId = useRef<number | null>(null);
  const minSwipeDistance = 100; // Minimum distance for a swipe
  const swipeThreshold = 30; // Distance to show visual feedback (schneller trigger)

  // Cleanup RAF on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  // Reset swipe state function
  const resetSwipeState = useCallback(() => {
    setSwipeState({ 
      isSwiping: false, 
      swipeDirection: null, 
      horizontalDistance: 0,
      absoluteDistance: 0
    });
  }, []);


  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
    setSwipeState({ 
      isSwiping: true, 
      swipeDirection: null, 
      horizontalDistance: 0,
      absoluteDistance: 0
    });
    handlers.onSwipeStart?.();
  }, [handlers]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swipeState.isSwiping) return;

    // Cancel previous RAF if still pending
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    touchCurrentX.current = e.touches[0].clientX;
    touchCurrentY.current = e.touches[0].clientY;

    // Use RAF to throttle state updates for smoother performance
    rafId.current = requestAnimationFrame(() => {
      const distanceX = touchCurrentX.current - touchStartX.current;
      const distanceY = touchCurrentY.current - touchStartY.current;
      const absDistanceX = Math.abs(distanceX);
      const absDistanceY = Math.abs(distanceY);
      
      // Determine primary direction
      let direction: 'left' | 'right' | 'up' | null = null;
      if (absDistanceX > absDistanceY) {
        direction = distanceX > 0 ? 'right' : 'left';
      } else if (distanceY < 0) {
        direction = 'up';
      }

      setSwipeState({
        isSwiping: true,
        swipeDirection: Math.max(absDistanceX, absDistanceY) > swipeThreshold ? direction : null,
        horizontalDistance: distanceX, // Always horizontal for glow
        absoluteDistance: absDistanceX > absDistanceY ? absDistanceX : absDistanceY,
      });
    });
  }, [swipeState.isSwiping]);

  const handleTouchEnd = useCallback(() => {
    const distanceX = touchCurrentX.current - touchStartX.current;
    const distanceY = touchCurrentY.current - touchStartY.current;
    
    // Determine primary swipe direction
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      // Horizontal swipe
      if (Math.abs(distanceX) > minSwipeDistance) {
        if (distanceX > 0) {
          triggerHaptic('medium');
          handlers.onSwipeRight?.();
        } else {
          triggerHaptic('medium');
          handlers.onSwipeLeft?.();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(distanceY) > minSwipeDistance && distanceY < 0) {
        triggerHaptic('medium');
        handlers.onSwipeUp?.();
      }
    }

    // Reset state
    resetSwipeState();
    handlers.onSwipeEnd?.();
  }, [handlers, resetSwipeState]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isMouseDown.current = true;
    touchStartX.current = e.clientX;
    touchCurrentX.current = e.clientX;
    touchStartY.current = e.clientY;
    touchCurrentY.current = e.clientY;
    setSwipeState({ 
      isSwiping: true, 
      swipeDirection: null, 
      horizontalDistance: 0,
      absoluteDistance: 0
    });
    handlers.onSwipeStart?.();
  }, [handlers]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isMouseDown.current) return;

    // Cancel previous RAF if still pending
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    touchCurrentX.current = e.clientX;
    touchCurrentY.current = e.clientY;

    // Use RAF to throttle state updates for smoother performance
    rafId.current = requestAnimationFrame(() => {
      const distanceX = touchCurrentX.current - touchStartX.current;
      const distanceY = touchCurrentY.current - touchStartY.current;
      const absDistanceX = Math.abs(distanceX);
      const absDistanceY = Math.abs(distanceY);
      
      // Determine primary direction
      let direction: 'left' | 'right' | 'up' | null = null;
      if (absDistanceX > absDistanceY) {
        direction = distanceX > 0 ? 'right' : 'left';
      } else if (distanceY < 0) {
        direction = 'up';
      }

      setSwipeState({
        isSwiping: true,
        swipeDirection: Math.max(absDistanceX, absDistanceY) > swipeThreshold ? direction : null,
        horizontalDistance: distanceX, // Always horizontal for glow
        absoluteDistance: absDistanceX > absDistanceY ? absDistanceX : absDistanceY,
      });
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isMouseDown.current) return;
    
    const distanceX = touchCurrentX.current - touchStartX.current;
    const distanceY = touchCurrentY.current - touchStartY.current;
    
    // Determine primary swipe direction
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      // Horizontal swipe
      if (Math.abs(distanceX) > minSwipeDistance) {
        if (distanceX > 0) {
          triggerHaptic('medium');
          handlers.onSwipeRight?.();
        } else {
          triggerHaptic('medium');
          handlers.onSwipeLeft?.();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(distanceY) > minSwipeDistance && distanceY < 0) {
        triggerHaptic('medium');
        handlers.onSwipeUp?.();
      }
    }

    isMouseDown.current = false;
    resetSwipeState();
    handlers.onSwipeEnd?.();
  }, [handlers, resetSwipeState]);

  return {
    swipeState,
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
    },
    resetSwipeState,
    triggerHaptic,
  };
};
