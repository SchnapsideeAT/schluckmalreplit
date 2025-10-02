import { memo, useState, useEffect } from "react";
import { Card, CardCategory } from "@/types/card";
import { getCardImage } from "@/utils/cardImageMapper";
import { useWindowSize } from "@/hooks/useWindowSize";
import { useCardSwipe } from "@/hooks/useCardSwipe";

/**
 * GameCard Component - Rebuilt with precise horizontal swipe system
 * 
 * Features:
 * - Only horizontal swipes (left/right)
 * - Touch only valid on card itself
 * - Threshold-based (35% screen width)
 * - Smooth snap-back animation
 * - Swipe-out animation when threshold met
 * - Responsive sizing for all devices
 */

interface GameCardProps {
  card: Card;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
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
  onSwipeLeft,
  onSwipeRight,
}: GameCardProps) => {
  const cardImageSrc = getCardImage(card.category, card.id);
  const categoryColor = categoryColorMap[card.category];
  const { width, height } = useWindowSize();
  
  // Card entrance animation
  const [isEntering, setIsEntering] = useState(true);
  
  useEffect(() => {
    setIsEntering(true);
    const timer = setTimeout(() => setIsEntering(false), 600);
    return () => clearTimeout(timer);
  }, [card.id]);

  // New swipe system
  const { swipeState, handlers, detachMouseListeners } = useCardSwipe({
    onSwipeLeft,
    onSwipeRight,
    threshold: 0.35, // 35% of screen width
  });

  // Cleanup mouse listeners on unmount
  useEffect(() => {
    return () => detachMouseListeners();
  }, [detachMouseListeners]);

  // Responsive card sizing
  let cardMaxHeight: number;
  let cardMaxWidth: number;
  
  if (width < 375) {
    cardMaxHeight = height * 0.58;
    cardMaxWidth = width * 0.75;
  } else if (width < 430) {
    cardMaxHeight = height * 0.60;
    cardMaxWidth = width * 0.78;
  } else if (width < 768) {
    cardMaxHeight = height * 0.62;
    cardMaxWidth = width * 0.80;
  } else {
    cardMaxHeight = height * 0.65;
    cardMaxWidth = Math.min(width * 0.50, 400);
  }

  const { isDragging, translateX, rotation, isAnimating } = swipeState;

  // Calculate opacity during swipe
  const opacity = translateX !== 0 ? Math.max(0.7, 1 - Math.abs(translateX) / 400) : 1;

  return (
    <div 
      className={`relative inline-block pointer-events-auto ${
        isEntering ? 'animate-enter' : ''
      }`}
      style={{ 
        width: `${cardMaxWidth}px`,
        height: `${cardMaxHeight}px`,
        transform: `translateX(${translateX}px) rotate(${rotation}deg) translateZ(0)`,
        opacity,
        backfaceVisibility: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isAnimating ? 'transform 0.3s ease-out, opacity 0.3s ease-out' : 'none',
        willChange: isDragging ? 'transform, opacity' : 'auto',
        touchAction: 'none', // Prevent browser default touch behaviors
      }}
      {...handlers}
    >
      {/* Card Image */}
      <img 
        src={cardImageSrc} 
        alt={`${card.category} Card ${card.id}`}
        className="w-full h-full object-contain rounded-2xl block select-none"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        style={{ 
          pointerEvents: 'none', // Image doesn't interfere with touch events
        }}
        onError={(e) => {
          console.error(`Failed to load ${card.category} card ${card.id}:`, cardImageSrc);
        }}
      />
    </div>
  );
});
