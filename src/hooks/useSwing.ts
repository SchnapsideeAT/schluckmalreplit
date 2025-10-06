import { useEffect, useRef, useState, useCallback } from "react";
import * as Swing from "swing";
import { triggerHaptic } from "@/utils/haptics";

/**
 * useSwing Hook - Production-Ready Version
 * 
 * Robust Swing-based swipe system with proper cleanup and mobile optimization.
 * 
 * Features:
 * - Single initialization (no re-init on re-renders)
 * - Proper cleanup to prevent memory leaks
 * - Mobile-optimized touch handling
 * - Only LEFT/RIGHT swipes supported
 * - Stable handler references via useRef
 * 
 * @param stackContainer - DOM element containing .swing-card elements
 * @param handlers - Swipe event callbacks
 */

interface SwingHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

interface SwingState {
  horizontalDistance: number;
  swipeDirection: 'left' | 'right' | null;
  isSwiping: boolean;
}

export const useSwing = (
  stackContainer: HTMLElement | null,
  handlers?: SwingHandlers
) => {
  const stackRef = useRef<any>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const handlersRef = useRef<SwingHandlers | undefined>(handlers);
  
  // Keep handlers updated without re-init
  handlersRef.current = handlers;

  const [swingState, setSwingState] = useState<SwingState>({
    horizontalDistance: 0,
    swipeDirection: null,
    isSwiping: false,
  });

  // Initialize Swing stack once when container is available
  useEffect(() => {
    if (!stackContainer) {
      console.log('🔄 useSwing: Waiting for stackContainer...');
      return;
    }
    
    // Prevent double initialization
    if (stackRef.current) {
      console.log('⚠️ useSwing: Already initialized, skipping');
      return;
    }

    console.log('🎯 useSwing: Initializing Swing stack...');

    // Swing configuration
    const config = {
      allowedDirections: [Swing.Direction.LEFT, Swing.Direction.RIGHT],
      throwOutConfidence: (xOffset: number, yOffset: number, element: HTMLElement) => {
        // Responsive: 40% of card width for throw (easier to swipe)
        const limit = element.offsetWidth * 0.4;
        const confidence = Math.min(Math.abs(xOffset) / limit, 1);
        return confidence;
      },
      throwOutDistance: () => {
        // Max throw distance based on screen width
        return Math.min(window.innerWidth * 0.6, 400);
      },
      minThrowOutDistance: 80,
      maxThrowRotation: 25,
    };

    let stack: any = null;
    
    try {
      // Create Swing stack
      stack = Swing.Stack(config);
      stackRef.current = stack;
    } catch (err) {
      console.error('❌ useSwing: Failed to create Swing stack', err);
      return;
    }

    // Find card elements
    const cardElements = Array.from(
      stackContainer.querySelectorAll<HTMLElement>('.swing-card')
    );
    
    if (!cardElements.length) {
      console.warn('⚠️ useSwing: No .swing-card elements found');
      stack?.destroy();
      stackRef.current = null;
      return;
    }

    cardsRef.current = cardElements;

    // Create cards in Swing
    cardElements.forEach((cardEl) => {
      try {
        stack.createCard(cardEl);
      } catch (err) {
        console.error('❌ useSwing: Failed to create card', err);
      }
    });

    // Event: dragmove - update visual feedback while dragging
    const onDragMove = (e: any) => {
      if (!e.target) return;

      // Use deltaX for real-time distance (smooth glow effect)
      const distance = e.deltaX || 0;
      
      setSwingState({
        horizontalDistance: distance,
        swipeDirection: distance < 0 ? 'left' : distance > 0 ? 'right' : null,
        isSwiping: true,
      });
    };

    // Event: throwout - card thrown (final swipe)
    const onThrowOut = (e: any) => {
      console.log('🎯 throwout event fired!', { direction: e.direction, throwDirection: e.throwDirection });
      
      const dir = e.direction;
      let side: 'left' | 'right' | null = null;

      // Only accept LEFT/RIGHT (ignore UP/DOWN)
      if (dir === Swing.Direction.LEFT) {
        side = 'left';
        console.log('✅ Card swiped LEFT');
      } else if (dir === Swing.Direction.RIGHT) {
        side = 'right';
        console.log('✅ Card swiped RIGHT');
      }

      // Reset visual state
      setSwingState({
        horizontalDistance: 0,
        swipeDirection: side,
        isSwiping: false,
      });

      // Call handler (if valid direction)
      if (side === 'left') {
        console.log('📞 Calling onSwipeLeft handler');
        triggerHaptic('medium');
        handlersRef.current?.onSwipeLeft?.();
      } else if (side === 'right') {
        console.log('📞 Calling onSwipeRight handler');
        triggerHaptic('medium');
        handlersRef.current?.onSwipeRight?.();
      }
    };

    // Event: throwin - card snapped back (cancelled swipe)
    const onThrowIn = () => {
      console.log('↩️ throwin event - card snapped back');
      setSwingState({
        horizontalDistance: 0,
        swipeDirection: null,
        isSwiping: false,
      });
    };

    // Attach event listeners
    stack.on('dragmove', onDragMove);
    stack.on('throwout', onThrowOut);
    stack.on('throwin', onThrowIn);

    console.log('✅ useSwing: Swing stack initialized successfully!', {
      cards: cardElements.length,
    });

    // Cleanup function
    return () => {
      console.log('🧹 useSwing: Cleaning up...');
      
      try {
        // Remove event listeners
        if (stack) {
          stack.off('dragmove', onDragMove);
          stack.off('throwout', onThrowOut);
          stack.off('throwin', onThrowIn);
        }

        // Destroy cards
        cardsRef.current.forEach((cardEl) => {
          try {
            const card = stack?.getCard?.(cardEl);
            if (card && typeof card.destroy === 'function') {
              card.destroy();
            }
          } catch (err) {
            // Ignore cleanup errors (card might be already removed)
          }
        });

        // Destroy stack
        if (stack && typeof stack.destroy === 'function') {
          stack.destroy();
        }
      } catch (err) {
        // Silent cleanup errors (expected on unmount)
        console.warn('useSwing: Cleanup error (non-critical):', err);
      } finally {
        stackRef.current = null;
        cardsRef.current = [];
      }
    };
  }, [stackContainer]); // Only re-init if container element changes

  // Manual reset function
  const resetSwingState = useCallback(() => {
    setSwingState({
      horizontalDistance: 0,
      swipeDirection: null,
      isSwiping: false,
    });
  }, []);

  return {
    swingState,
    resetSwingState,
  };
};
