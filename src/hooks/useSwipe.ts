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
  horizontalDistance: number;
  absoluteDistance: number;
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
  const safetyTimeoutId = useRef<number | null>(null);
  
  const getMinSwipeDistance = () => {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 390;
    return screenWidth * 0.4;
  };
  const swipeThreshold = 30;

  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
      if (safetyTimeoutId.current !== null) {
        clearTimeout(safetyTimeoutId.current);
      }
    };
  }, []);

  const resetSwipeState = useCallback(() => {
    if (safetyTimeoutId.current !== null) {
      clearTimeout(safetyTimeoutId.current);
      safetyTimeoutId.current = null;
    }
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    setSwipeState({
      isSwiping: false,
      swipeDirection: null,
      horizontalDistance: 0,
      absoluteDistance: 0
    });
  }, []);

  const startSafetyTimeout = () => {
    if (safetyTimeoutId.current !== null) {
      clearTimeout(safetyTimeoutId.current);
    }
    safetyTimeoutId.current = window.setTimeout(() => {
      if (safetyTimeoutId.current !== null) {
        clearTimeout(safetyTimeoutId.current);
        safetyTimeoutId.current = null;
      }
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      setSwipeState({
        isSwiping: false,
        swipeDirection: null,
        horizontalDistance: 0,
        absoluteDistance: 0
      });
      handlers.onSwipeEnd?.();
    }, 3000);
  };

  useEffect(() => {
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      if (!isMouseDown.current) return;

      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      touchCurrentX.current = e.clientX;
      touchCurrentY.current = e.clientY;

      rafId.current = requestAnimationFrame(() => {
        const distanceX = touchCurrentX.current - touchStartX.current;
        const distanceY = touchCurrentY.current - touchStartY.current;
        const absDistanceX = Math.abs(distanceX);
        const absDistanceY = Math.abs(distanceY);

        let direction: 'left' | 'right' | 'up' | null = null;
        if (absDistanceX > absDistanceY) {
          direction = distanceX > 0 ? 'right' : 'left';
        } else if (distanceY < 0) {
          direction = 'up';
        }

        setSwipeState({
          isSwiping: true,
          swipeDirection: Math.max(absDistanceX, absDistanceY) > swipeThreshold ? direction : null,
          horizontalDistance: distanceX,
          absoluteDistance: absDistanceX > absDistanceY ? absDistanceX : absDistanceY,
        });
      });
    };

    const handleMouseUpGlobal = () => {
      if (!isMouseDown.current) return;

      const distanceX = touchCurrentX.current - touchStartX.current;
      const distanceY = touchCurrentY.current - touchStartY.current;
      const minDist = getMinSwipeDistance();

      if (Math.abs(distanceX) > Math.abs(distanceY)) {
        if (Math.abs(distanceX) > minDist) {
          if (distanceX > 0) {
            triggerHaptic('medium');
            handlers.onSwipeRight?.();
          } else {
            triggerHaptic('medium');
            handlers.onSwipeLeft?.();
          }
        }
      } else {
        if (Math.abs(distanceY) > minDist && distanceY < 0) {
          triggerHaptic('medium');
          handlers.onSwipeUp?.();
        }
      }

      isMouseDown.current = false;
      resetSwipeState();
      handlers.onSwipeEnd?.();
    };

    document.addEventListener('mousemove', handleMouseMoveGlobal);
    document.addEventListener('mouseup', handleMouseUpGlobal);

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [handlers, resetSwipeState]);

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
    startSafetyTimeout();
    handlers.onSwipeStart?.();
  }, [handlers]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swipeState.isSwiping) return;

    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    touchCurrentX.current = e.touches[0].clientX;
    touchCurrentY.current = e.touches[0].clientY;

    rafId.current = requestAnimationFrame(() => {
      const distanceX = touchCurrentX.current - touchStartX.current;
      const distanceY = touchCurrentY.current - touchStartY.current;
      const absDistanceX = Math.abs(distanceX);
      const absDistanceY = Math.abs(distanceY);

      let direction: 'left' | 'right' | 'up' | null = null;
      if (absDistanceX > absDistanceY) {
        direction = distanceX > 0 ? 'right' : 'left';
      } else if (distanceY < 0) {
        direction = 'up';
      }

      setSwipeState({
        isSwiping: true,
        swipeDirection: Math.max(absDistanceX, absDistanceY) > swipeThreshold ? direction : null,
        horizontalDistance: distanceX,
        absoluteDistance: absDistanceX > absDistanceY ? absDistanceX : absDistanceY,
      });
    });
  }, [swipeState.isSwiping]);

  const handleTouchEnd = useCallback(() => {
    const distanceX = touchCurrentX.current - touchStartX.current;
    const distanceY = touchCurrentY.current - touchStartY.current;
    const minDist = getMinSwipeDistance();

    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      if (Math.abs(distanceX) > minDist) {
        if (distanceX > 0) {
          triggerHaptic('medium');
          handlers.onSwipeRight?.();
        } else {
          triggerHaptic('medium');
          handlers.onSwipeLeft?.();
        }
      }
    } else {
      if (Math.abs(distanceY) > minDist && distanceY < 0) {
        triggerHaptic('medium');
        handlers.onSwipeUp?.();
      }
    }

    resetSwipeState();
    handlers.onSwipeEnd?.();
  }, [handlers, resetSwipeState]);

  const handleTouchCancel = useCallback(() => {
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
    startSafetyTimeout();
    handlers.onSwipeStart?.();
  }, [handlers]);

  return {
    swipeState,
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
      onMouseDown: handleMouseDown,
      onMouseMove: () => {},
      onMouseUp: () => {},
    },
    resetSwipeState,
    triggerHaptic,
  };
};
