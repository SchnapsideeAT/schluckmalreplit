import { memo, useState, useEffect, useRef } from "react";
import { Card, CardCategory } from "@/types/card";
import { getCardImage } from "@/utils/cardImageMapper";
import { useWindowSize } from "@/hooks/useWindowSize";
import { useFeatureFlags } from "@/utils/featureFlags";

/**
 * GameCard Component
 * 
 * Optimized card display with:
 * - GPU-accelerated animations (transform, opacity)
 * - Feature flag support for low-end devices
 * - Lazy-loaded card images
 * - Swipe gesture feedback
 * - Responsive scaling
 * 
 * Performance optimizations:
 * - Uses `memo` to prevent unnecessary re-renders
 * - `will-change` for GPU acceleration
 * - RAF-throttled swipe updates via parent
 * - Cached window size via custom hook
 */

interface GameCardProps {
  card: Card;
  horizontalDistance?: number;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseUp?: (e: React.MouseEvent) => void;
}

const categoryColorMap: Record<CardCategory, string> = {
  Wahrheit: "199 91% 42%",
  Aufgabe: "265 27% 57%", 
  Gruppe: "101 55% 44%",
  Duell: "38 91% 59%",
  Wildcard: "352 78% 58%",
};

export const GameCard = memo(({ 
  card, 
  horizontalDistance = 0,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}: GameCardProps) => {
  const cardImageSrc = getCardImage(card.category, card.id);
  const categoryColor = categoryColorMap[card.category];
  const { width, height } = useWindowSize();
  const { flags } = useFeatureFlags();
  
  const shouldAnimateComplex = flags.enableComplexAnimations;
  
  // Ref to card container
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  
  // Animation state: 'entering' | 'visible'
  const [animationState, setAnimationState] = useState<'entering' | 'visible'>('entering');
  
  // Handle card changes with animation - ALWAYS animate
  useEffect(() => {
    setAnimationState('entering');
    
    const timer = setTimeout(() => {
      setAnimationState('visible');
    }, 600); // Match CSS animation duration
    
    return () => clearTimeout(timer);
  }, [card.id]);

  // Document-level listeners for tracking outside card during swipe
  useEffect(() => {
    if (!isSwiping) return;

    const handleDocumentTouchMove = (e: TouchEvent) => {
      // Create wrapper that looks like React.TouchEvent with essential properties
      const syntheticEvent = {
        touches: e.touches,
        changedTouches: e.changedTouches,
        targetTouches: e.targetTouches,
        currentTarget: cardContainerRef.current,
        target: e.target,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        shiftKey: e.shiftKey,
        preventDefault: () => e.preventDefault(),
        stopPropagation: () => e.stopPropagation(),
        nativeEvent: e
      } as unknown as React.TouchEvent;
      onTouchMove?.(syntheticEvent);
    };

    const handleDocumentTouchEnd = (e: TouchEvent) => {
      setIsSwiping(false);
      const syntheticEvent = {
        touches: e.touches,
        changedTouches: e.changedTouches,
        targetTouches: e.targetTouches,
        currentTarget: cardContainerRef.current,
        target: e.target,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        shiftKey: e.shiftKey,
        preventDefault: () => e.preventDefault(),
        stopPropagation: () => e.stopPropagation(),
        nativeEvent: e
      } as unknown as React.TouchEvent;
      onTouchEnd?.(syntheticEvent);
    };

    const handleDocumentMouseMove = (e: MouseEvent) => {
      const syntheticEvent = {
        clientX: e.clientX,
        clientY: e.clientY,
        pageX: e.pageX,
        pageY: e.pageY,
        screenX: e.screenX,
        screenY: e.screenY,
        currentTarget: cardContainerRef.current,
        target: e.target,
        button: e.button,
        buttons: e.buttons,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        shiftKey: e.shiftKey,
        preventDefault: () => e.preventDefault(),
        stopPropagation: () => e.stopPropagation(),
        nativeEvent: e
      } as unknown as React.MouseEvent;
      onMouseMove?.(syntheticEvent);
    };

    const handleDocumentMouseUp = (e: MouseEvent) => {
      setIsSwiping(false);
      const syntheticEvent = {
        clientX: e.clientX,
        clientY: e.clientY,
        pageX: e.pageX,
        pageY: e.pageY,
        screenX: e.screenX,
        screenY: e.screenY,
        currentTarget: cardContainerRef.current,
        target: e.target,
        button: e.button,
        buttons: e.buttons,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        shiftKey: e.shiftKey,
        preventDefault: () => e.preventDefault(),
        stopPropagation: () => e.stopPropagation(),
        nativeEvent: e
      } as unknown as React.MouseEvent;
      onMouseUp?.(syntheticEvent);
    };

    document.addEventListener('touchmove', handleDocumentTouchMove);
    document.addEventListener('touchend', handleDocumentTouchEnd);
    document.addEventListener('touchcancel', handleDocumentTouchEnd);
    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);

    return () => {
      document.removeEventListener('touchmove', handleDocumentTouchMove);
      document.removeEventListener('touchend', handleDocumentTouchEnd);
      document.removeEventListener('touchcancel', handleDocumentTouchEnd);
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
  }, [isSwiping, onTouchMove, onTouchEnd, onMouseMove, onMouseUp]);

  // Card-level start handlers
  const handleCardTouchStart = (e: React.TouchEvent) => {
    setIsSwiping(true);
    onTouchStart?.(e);
  };

  const handleCardMouseDown = (e: React.MouseEvent) => {
    setIsSwiping(true);
    onMouseDown?.(e);
  };

  // Calculate rotation and opacity based on horizontal swipe
  const rotation = horizontalDistance * 0.1;
  const opacity = horizontalDistance !== 0 ? Math.max(0.5, 1 - Math.abs(horizontalDistance) / 300) : 1;

  // Responsive card sizing - optimized for all devices
  let cardMaxHeight: number;
  let cardMaxWidth: number;
  
  if (width < 375) {
    // Compact phones (iPhone SE, small Android)
    cardMaxHeight = height * 0.58;
    cardMaxWidth = width * 0.75;
  } else if (width < 430) {
    // Standard phones (iPhone 13/14/15, Galaxy S23/24, Pixel 7/8)
    cardMaxHeight = height * 0.60;
    cardMaxWidth = width * 0.78;
  } else if (width < 768) {
    // Large phones & phablets (iPhone Pro Max, Galaxy Ultra, Pixel Pro)
    cardMaxHeight = height * 0.62;
    cardMaxWidth = width * 0.80;
  } else {
    // Tablets & Desktop
    cardMaxHeight = height * 0.65;
    cardMaxWidth = Math.min(width * 0.50, 400); // Max 400px on large screens
  }

  return (
    <div 
      className={`absolute inset-0 touch-none flex items-center justify-center ${
        animationState === 'entering' ? 'animate-enter' : ''
      }`}
      style={{
        transform: horizontalDistance !== 0 
          ? `translateX(${horizontalDistance}px) rotate(${rotation}deg)`
          : undefined,
        opacity: horizontalDistance !== 0 ? opacity : undefined,
        transition: 'none',
        willChange: horizontalDistance !== 0 ? 'transform, opacity' : 'auto'
      }}
    >
      {/* Card Container with responsive sizing - swipe handlers on card only */}
      <div 
        ref={cardContainerRef}
        className="relative inline-block touch-auto"
        style={{ 
          width: `${cardMaxWidth}px`,
          height: `${cardMaxHeight}px`,
          maxHeight: `${cardMaxHeight}px`,
          maxWidth: `${cardMaxWidth}px`,
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          cursor: isSwiping ? 'grabbing' : 'grab',
        }}
        onTouchStart={handleCardTouchStart}
        onMouseDown={handleCardMouseDown}
      >
        {/* SVG Card Image */}
        <img 
          src={cardImageSrc} 
          alt={`${card.category} Card ${card.id}`}
          className="w-full h-auto object-contain rounded-2xl block select-none"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          onPointerDown={(e) => {
            if (e.pointerType === 'touch') {
              e.preventDefault();
            }
          }}
          style={{
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none'
          }}
          onError={(e) => {
            console.error(`Failed to load ${card.category} card ${card.id}:`, cardImageSrc);
            console.error('Image element:', e.currentTarget);
          }}
        />
      </div>
    </div>
  );
});
