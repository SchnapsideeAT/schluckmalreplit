import { memo, useState, useEffect } from "react";
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
  onTouchEnd?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseUp?: () => void;
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

  // Calculate rotation and opacity based on horizontal swipe
  const rotation = horizontalDistance * 0.1;
  const opacity = horizontalDistance !== 0 ? Math.max(0.5, 1 - Math.abs(horizontalDistance) / 300) : 1;

  // Responsive card sizing - optimized for all devices
  let cardMaxHeight: number;
  let cardMaxWidth: number;
  
  if (width < 375) {
    // Compact phones (iPhone SE, small Android)
    cardMaxHeight = height * 0.75;
    cardMaxWidth = width * 0.88;
  } else if (width < 430) {
    // Standard phones (iPhone 13/14/15, Galaxy S23/24, Pixel 7/8)
    cardMaxHeight = height * 0.80;
    cardMaxWidth = width * 0.90;
  } else if (width < 768) {
    // Large phones & phablets (iPhone Pro Max, Galaxy Ultra, Pixel Pro)
    cardMaxHeight = height * 0.82;
    cardMaxWidth = width * 0.92;
  } else {
    // Tablets & Desktop
    cardMaxHeight = height * 0.75;
    cardMaxWidth = Math.min(width * 0.6, 500); // Max 500px on large screens
  }

  return (
    <div 
      className={`w-full relative touch-none flex items-center justify-center ${
        animationState === 'entering' ? 'animate-enter' : ''
      }`}
      style={{
        transform: horizontalDistance !== 0 
          ? `translateX(${horizontalDistance}px) rotate(${rotation}deg)`
          : undefined,
        opacity: horizontalDistance !== 0 ? opacity : undefined,
        transition: 'none',
        cursor: 'grab',
        willChange: horizontalDistance !== 0 ? 'transform, opacity' : 'auto'
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      {/* Card Container with responsive sizing */}
      <div 
        className="relative inline-block"
        style={{ 
          width: `${cardMaxWidth}px`,
          height: `${cardMaxHeight}px`,
          maxHeight: `${cardMaxHeight}px`,
          maxWidth: `${cardMaxWidth}px`,
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      >
        {/* Glow Effect Background - GPU optimized with opacity */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-30"
          style={{
            background: `radial-gradient(circle at center, hsl(${categoryColor} / 0.4), transparent 70%)`,
            animation: shouldAnimateComplex ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
            zIndex: -1,
            transform: 'translateZ(0)',
          }}
        />
        
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
