import { useState, useRef, useCallback } from "react";
import { triggerHaptic } from "@/utils/haptics";

/**
 * useCardSwipe Hook - Horizontal-only card swipe system
 * 
 * Features:
 * - Only horizontal movement (vertical ignored)
 * - Touch must start on card
 * - Threshold-based: 30-40% screen width
 * - Smooth snap-back animation if threshold not met
 * - Swipe-out animation if threshold met
 */

type SwipeDirection = 'left' | 'right' | null;

interface UseCardSwipeProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // Percentage of screen width (default: 35%)
}

interface SwipeState {
  isDragging: boolean;
  translateX: number;
  rotation: number;
  isAnimating: boolean;
}

export const useCardSwipe = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 0.35
}: UseCardSwipeProps) => {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    isDragging: false,
    translateX: 0,
    rotation: 0,
    isAnimating: false,
  });

  const startX = useRef<number>(0);
  const currentX = useRef<number>(0);
  const thresholdPx = useRef<number>(window.innerWidth * threshold);

  // Update threshold on window resize
  const updateThreshold = useCallback(() => {
    thresholdPx.current = window.innerWidth * threshold;
  }, [threshold]);

  // Handle drag start (touch/mouse)
  const handleDragStart = useCallback((clientX: number) => {
    startX.current = clientX;
    currentX.current = clientX;
    updateThreshold();
    
    setSwipeState({
      isDragging: true,
      translateX: 0,
      rotation: 0,
      isAnimating: false,
    });
  }, [updateThreshold]);

  // Handle drag move
  const handleDragMove = useCallback((clientX: number) => {
    if (!swipeState.isDragging) return;

    currentX.current = clientX;
    const deltaX = clientX - startX.current;
    
    // Calculate rotation based on drag distance (max ±15 degrees)
    const rotation = (deltaX / thresholdPx.current) * 15;
    const clampedRotation = Math.max(-15, Math.min(15, rotation));

    setSwipeState(prev => ({
      ...prev,
      translateX: deltaX,
      rotation: clampedRotation,
    }));
  }, [swipeState.isDragging]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!swipeState.isDragging) return;

    const deltaX = currentX.current - startX.current;
    const absDeltaX = Math.abs(deltaX);

    // Check if threshold is met
    if (absDeltaX >= thresholdPx.current) {
      // Successful swipe - animate out
      const direction: SwipeDirection = deltaX > 0 ? 'right' : 'left';
      const targetX = direction === 'right' ? window.innerWidth : -window.innerWidth;

      setSwipeState({
        isDragging: false,
        translateX: targetX,
        rotation: direction === 'right' ? 30 : -30,
        isAnimating: true,
      });

      // Trigger haptic feedback
      triggerHaptic('medium');

      // Call callback after animation
      setTimeout(() => {
        if (direction === 'left') {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
      }, 300); // Match animation duration
    } else {
      // Not enough distance - snap back to center
      setSwipeState({
        isDragging: false,
        translateX: 0,
        rotation: 0,
        isAnimating: true,
      });

      // Reset animation flag after transition
      setTimeout(() => {
        setSwipeState(prev => ({ ...prev, isAnimating: false }));
      }, 300);
    }
  }, [swipeState.isDragging, onSwipeLeft, onSwipeRight]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  }, [handleDragStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  }, [handleDragMove]);

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  }, [handleDragStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleDragMove(e.clientX);
  }, [handleDragMove]);

  const handleMouseUp = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Attach/detach global mouse listeners
  const attachMouseListeners = useCallback(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  const detachMouseListeners = useCallback(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  return {
    swipeState,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: (e: React.MouseEvent) => {
        handleMouseDown(e);
        attachMouseListeners();
      },
    },
    detachMouseListeners,
  };
};
