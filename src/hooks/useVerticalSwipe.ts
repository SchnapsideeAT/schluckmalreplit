import { useRef, useCallback } from "react";
import { triggerHaptic } from "@/utils/haptics";

/**
 * useVerticalSwipe Hook
 * 
 * Specialized hook for VERTICAL swipes only.
 * Ignores and aborts horizontal swipes to allow them to pass through to underlying elements.
 * 
 * @param onSwipeUp - Callback when user swipes up
 * @returns Event handlers for touch/mouse events
 */

interface VerticalSwipeHandlers {
  onSwipeUp?: () => void;
}

export const useVerticalSwipe = (handlers: VerticalSwipeHandlers) => {
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);
  const isMouseDown = useRef<boolean>(false);
  const isVerticalSwipe = useRef<boolean>(false);
  const minSwipeDistance = 100; // Minimum distance for a swipe
  const directionThreshold = 30; // Distance to determine swipe direction

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchCurrentX.current = e.touches[0].clientX;
    touchCurrentY.current = e.touches[0].clientY;
    isVerticalSwipe.current = true; // Assume vertical until proven otherwise
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isVerticalSwipe.current) return;

    touchCurrentX.current = e.touches[0].clientX;
    touchCurrentY.current = e.touches[0].clientY;

    const distanceX = Math.abs(touchCurrentX.current - touchStartX.current);
    const distanceY = Math.abs(touchCurrentY.current - touchStartY.current);

    // If horizontal movement exceeds vertical, abort vertical swipe
    if (distanceX > distanceY && distanceX > directionThreshold) {
      isVerticalSwipe.current = false;
      return;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isVerticalSwipe.current) {
      isVerticalSwipe.current = true; // Reset for next swipe
      return;
    }

    const distanceX = Math.abs(touchCurrentX.current - touchStartX.current);
    const distanceY = touchCurrentY.current - touchStartY.current;

    // Only trigger if predominantly vertical and meets minimum distance
    if (Math.abs(distanceY) > distanceX && Math.abs(distanceY) > minSwipeDistance) {
      if (distanceY < 0) { // Swipe up
        triggerHaptic('medium');
        handlers.onSwipeUp?.();
      }
    }

    isVerticalSwipe.current = true; // Reset for next swipe
  }, [handlers]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isMouseDown.current = true;
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
    touchCurrentX.current = e.clientX;
    touchCurrentY.current = e.clientY;
    isVerticalSwipe.current = true;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isMouseDown.current || !isVerticalSwipe.current) return;

    touchCurrentX.current = e.clientX;
    touchCurrentY.current = e.clientY;

    const distanceX = Math.abs(touchCurrentX.current - touchStartX.current);
    const distanceY = Math.abs(touchCurrentY.current - touchStartY.current);

    // If horizontal movement exceeds vertical, abort vertical swipe
    if (distanceX > distanceY && distanceX > directionThreshold) {
      isVerticalSwipe.current = false;
      return;
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isMouseDown.current) return;

    if (!isVerticalSwipe.current) {
      isMouseDown.current = false;
      isVerticalSwipe.current = true;
      return;
    }

    const distanceX = Math.abs(touchCurrentX.current - touchStartX.current);
    const distanceY = touchCurrentY.current - touchStartY.current;

    // Only trigger if predominantly vertical and meets minimum distance
    if (Math.abs(distanceY) > distanceX && Math.abs(distanceY) > minSwipeDistance) {
      if (distanceY < 0) { // Swipe up
        triggerHaptic('medium');
        handlers.onSwipeUp?.();
      }
    }

    isMouseDown.current = false;
    isVerticalSwipe.current = true;
  }, [handlers]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
  };
};
