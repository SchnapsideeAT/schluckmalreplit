import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, ArrowUp, Check } from "lucide-react";
import { useSwipe } from "@/hooks/useSwipe";
import { SwipeOverlay } from "@/components/SwipeOverlay";
import { PlayerTransition } from "@/components/PlayerTransition";
import { triggerHaptic } from "@/utils/haptics";
import { playSound } from "@/utils/sounds";
import { markInteractiveTutorialAsShown } from "@/utils/localStorage";
import { useSettings } from "@/hooks/useSettings";
import { useWindowSize } from "@/hooks/useWindowSize";
import cardBackSvg from "@/assets/card-back.svg";

interface TutorialStep {
  title: string;
  description: string;
  requiredSwipe?: 'left' | 'right' | 'up';
  icon?: React.ReactNode;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Los geht's mit Schluck mal!",
    description: "Das einzige Trinkspiel das du brauchen wirst.",
    icon: <div className="text-6xl animate-wave">👋</div>,
  },
  {
    title: "Swipe nach rechts",
    description: "Wische die Karte nach rechts, um die Aufgabe zu erfüllen.",
    requiredSwipe: 'right',
    icon: <ArrowRight className="w-16 h-16 text-green-500" />,
  },
  {
    title: "Swipe nach links",
    description: "Wische die Karte nach links, wenn du die Aufgabe trinkst oder überspringst.",
    requiredSwipe: 'left',
    icon: <ArrowLeft className="w-16 h-16 text-red-500" />,
  },
  {
    title: "Swipe nach oben",
    description: "Wische nach oben, um die Statistik der Runde zu sehen.",
    requiredSwipe: 'up',
    icon: <ArrowUp className="w-16 h-16 text-primary" />,
  },
];

export const InteractiveTutorial = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();
  const { width, height } = useWindowSize();
  const [currentStep, setCurrentStep] = useState(0);
  const [showPlayerTransition, setShowPlayerTransition] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  
  // Card aspect ratio from SVG: 167.24 / 260.79 ≈ 0.641
  const CARD_ASPECT_RATIO = 167.24 / 260.79;
  
  // Responsive card sizing - synchronized with GameCard (HEIGHT-FIRST)
  let cardMaxHeight: number;
  let cardMaxWidth: number;
  
  if (width < 375) {
    // Compact phones (iPhone SE, small Android)
    cardMaxHeight = height * 0.55;
    cardMaxWidth = cardMaxHeight * CARD_ASPECT_RATIO;
  } else if (width < 430) {
    // Standard phones (iPhone 13/14/15, Galaxy S23/24, Pixel 7/8)
    cardMaxHeight = height * 0.58;
    cardMaxWidth = cardMaxHeight * CARD_ASPECT_RATIO;
  } else if (width < 768) {
    // Large phones & phablets (iPhone Pro Max, Galaxy Ultra, Pixel Pro)
    cardMaxHeight = height * 0.60;
    cardMaxWidth = cardMaxHeight * CARD_ASPECT_RATIO;
  } else {
    // Tablets & Desktop
    cardMaxHeight = height * 0.65;
    cardMaxWidth = Math.min(cardMaxHeight * CARD_ASPECT_RATIO, 480);
  }

  // Swipe handling for tutorial
  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    if (currentStep === 0) {
      // First step: accept any swipe to proceed
      triggerHaptic('light', settings.hapticEnabled);
      playSound('success', settings.soundEnabled);
      setCanProceed(true);
      return;
    }

    if (step.requiredSwipe === direction) {
      // Correct swipe
      triggerHaptic('medium', settings.hapticEnabled);
      playSound('success', settings.soundEnabled);
      setCanProceed(true);
    } else if (step.requiredSwipe) {
      // Wrong swipe
      triggerHaptic('light', settings.hapticEnabled);
      playSound('buttonClick', settings.soundEnabled);
    }
  };

  const { swipeState, swipeHandlers, resetSwipeState } = useSwipe({
    onSwipeLeft: () => handleSwipe('left'),
    onSwipeRight: () => handleSwipe('right'),
    onSwipeUp: () => handleSwipe('up'),
  });

  const handleNext = () => {
    if (!canProceed && currentStep > 0) return;

    if (isLastStep) {
      completeTutorial();
    } else {
      setCurrentStep(prev => prev + 1);
      setCanProceed(false);
    }
  };

  const completeTutorial = () => {
    markInteractiveTutorialAsShown();
    
    // Check if coming from Settings
    if (location.state?.fromSettings) {
      navigate('/settings');
    } else {
      // Normal game flow: Setup -> Tutorial -> Game
      const state = location.state as { players?: any[]; selectedCategories?: any[] };
      navigate('/game', { state });
    }
  };

  const handleSkip = () => {
    if (location.state?.fromSettings) {
      navigate('/settings');
    } else {
      markInteractiveTutorialAsShown();
      const state = location.state as { players?: any[]; selectedCategories?: any[] };
      navigate('/game', { state });
    }
  };

  // Reset swipe state when tutorial step changes
  useEffect(() => {
    resetSwipeState();
  }, [currentStep, resetSwipeState]);

  // Auto-proceed after correct swipe
  useEffect(() => {
    if (canProceed && currentStep > 0 && currentStep < tutorialSteps.length) {
      const timer = setTimeout(() => {
        handleNext();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [canProceed, currentStep]);


  return (
    <div className="min-h-dvh h-dvh bg-background flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background - solid gray */}
      <div className="absolute inset-0 pointer-events-none" />

      {/* Progress indicator */}
      <div className="absolute left-1/2 -translate-x-1/2 flex gap-2 z-50" style={{ top: 'max(2rem, calc(2rem + env(safe-area-inset-top, 0px)))' }}>
        {tutorialSteps.map((_, index) => (
          <div
            key={index}
            className={`h-3 rounded-full transition-all ${
              index === currentStep
                ? "w-10 bg-primary"
                : index < currentStep
                ? "w-3 bg-primary/50"
                : "w-3 bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Special fullscreen layout for swipe up step */}
      {step.requiredSwipe === 'up' && (
        <div className="absolute inset-0 z-20" {...swipeHandlers}>
          {/* Text content in vertical center */}
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="flex flex-col items-center gap-4">
              <ArrowUp className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-primary animate-bounce" />
              <div className="text-center space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">{step.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md">{step.description}</p>
              </div>
            </div>
          </div>

          {/* Swipe area indicator at bottom - no gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-40 flex items-center justify-center">
            <div className="text-center">
              <ArrowUp className="w-12 h-12 sm:w-16 sm:h-16 text-primary animate-bounce mx-auto" />
            </div>
          </div>
        </div>
      )}

      {/* Main content - hidden for swipe up */}
      <div className={`relative z-10 flex flex-col items-center gap-4 sm:gap-8 w-full max-w-md px-2 ${step.requiredSwipe === 'up' ? 'invisible' : ''}`}>
        {/* Icon/Visual */}
        {step.icon && !step.requiredSwipe && (
          <div className="flex justify-center animate-scale-in mt-4">
            {step.icon}
          </div>
        )}

        {/* Tutorial card for left/right swipe steps */}
        {step.requiredSwipe && (
          <div className="w-full flex flex-col items-center gap-4 sm:gap-6">
            <div 
              className="relative touch-none select-none cursor-grab active:cursor-grabbing transition-transform flex items-center justify-center overflow-hidden"
              style={{
                height: `${cardMaxHeight}px`,
                width: `${cardMaxWidth}px`,
                transform: `translateX(${swipeState.horizontalDistance}px) rotate(${swipeState.horizontalDistance * 0.1}deg)`,
                transition: swipeState.isSwiping ? 'none' : 'transform 0.3s ease-out',
              }}
              {...swipeHandlers}
            >
              <div className="relative h-full flex items-center justify-center">
                <img 
                  src={cardBackSvg} 
                  alt="Tutorial Card" 
                  className="h-full w-auto max-w-full object-contain rounded-2xl mx-auto"
                  draggable={false}
                />
                
                {/* Success checkmark */}
                {canProceed && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-green-500 rounded-full p-4 animate-scale-in">
                      <Check className="w-12 h-12 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Direction icon hint below card with text */}
            <div className={`flex flex-col items-center gap-4 ${canProceed ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
              {step.requiredSwipe === 'right' && (
                <>
                  <ArrowRight className="w-16 h-16 sm:w-20 sm:h-20 text-green-500 animate-bounce-right" />
                  <div className="text-center space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">{step.title}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-md">{step.description}</p>
                  </div>
                </>
              )}
              {step.requiredSwipe === 'left' && (
                <>
                  <ArrowLeft className="w-16 h-16 sm:w-20 sm:h-20 text-red-500 animate-bounce-left" />
                  <div className="text-center space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">{step.title}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-md">{step.description}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Swipe overlay for visual feedback - only for horizontal swipes */}
        {step.requiredSwipe && step.requiredSwipe !== 'up' && swipeState.isSwiping && Math.abs(swipeState.horizontalDistance) > 20 && (
          <SwipeOverlay
            horizontalDistance={swipeState.horizontalDistance}
            swipeDirection={swipeState.swipeDirection}
            isSwiping={swipeState.isSwiping}
          />
        )}

        {/* Text content - only for non-swipe steps */}
        {!step.requiredSwipe && (
          <div className="text-center space-y-2 sm:space-y-4 px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{step.title}</h2>
            <p className="text-base sm:text-lg text-muted-foreground">{step.description}</p>
          </div>
        )}

        {/* Action buttons for non-swipe steps */}
        {!step.requiredSwipe && (
          <Button
            onClick={handleNext}
            className="w-full bg-primary hover:bg-primary/90 mt-2 sm:mt-4"
            size="lg"
          >
            {isLastStep ? (
              <>
                Los geht's!
                <Check className="w-5 h-5 ml-2" />
              </>
            ) : (
              "Weiter"
            )}
          </Button>
        )}
      </div>

      {/* Skip button at bottom center */}
      <div className="absolute left-1/2 -translate-x-1/2 z-30" style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}>
        <Button
          onClick={handleSkip}
          variant="ghost"
          className={`text-sm sm:text-base hover:bg-transparent ${
            step.requiredSwipe === 'up'
              ? 'text-white hover:text-white/90 font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Überspringen
        </Button>
      </div>
    </div>
  );
};
