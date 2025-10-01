import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Hand } from "lucide-react";
import { hasShownTutorial, markTutorialAsShown } from "@/utils/localStorage";

interface TutorialProps {
  onComplete?: () => void;
}

const tutorialSteps = [
  {
    title: "Willkommen bei Schluck mal!",
    description: "Lass uns dir zeigen, wie du spielst. Es ist ganz einfach!",
    icon: <Hand className="w-16 h-16 text-primary" />,
  },
  {
    title: "Karte ziehen",
    description: "Tippe auf die Karte oder ziehe sie, um die nächste Karte zu sehen.",
    icon: <div className="text-6xl">👆</div>,
  },
  {
    title: "Nach rechts wischen",
    description: "Wische nach rechts ➡️ wenn du die Aufgabe erfüllst.",
    visual: (
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 bg-green-500/20 rounded-2xl border-2 border-green-500 flex items-center justify-center animate-pulse">
          <ArrowRight className="w-12 h-12 text-green-500" />
        </div>
      </div>
    ),
  },
  {
    title: "Nach links wischen",
    description: "Wische nach links ⬅️ um die Aufgabe abzulehnen und zu trinken.",
    visual: (
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 bg-red-500/20 rounded-2xl border-2 border-red-500 flex items-center justify-center animate-pulse">
          <ArrowLeft className="w-12 h-12 text-red-500" />
        </div>
      </div>
    ),
  },
  {
    title: "Viel Spaß!",
    description: "Das war's schon! Denkt daran, verantwortungsvoll zu spielen und eure Grenzen zu kennen.",
    icon: <div className="text-6xl">🎉</div>,
  },
];

export const Tutorial = ({ onComplete }: TutorialProps) => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Show tutorial if not shown before
    if (!hasShownTutorial()) {
      setOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    markTutorialAsShown();
    setOpen(false);
    onComplete?.();
  };

  const handleSkip = () => {
    markTutorialAsShown();
    setOpen(false);
    onComplete?.();
  };

  const step = tutorialSteps[currentStep];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md bg-card border-primary/30">
        <div className="space-y-6 p-4">
          {/* Step indicator */}
          <div className="flex justify-center gap-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-8 bg-primary"
                    : index < currentStep
                    ? "w-2 bg-primary/50"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="text-center space-y-4">
            {step.icon && <div className="flex justify-center">{step.icon}</div>}
            {step.visual && <div className="flex justify-center">{step.visual}</div>}
            
            <h2 className="text-2xl font-bold text-foreground">{step.title}</h2>
            <p className="text-muted-foreground">{step.description}</p>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                onClick={handlePrevious}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück
              </Button>
            )}
            
            {currentStep === 0 && (
              <Button
                onClick={handleSkip}
                variant="ghost"
                className="flex-1"
              >
                Überspringen
              </Button>
            )}

            <Button
              onClick={handleNext}
              className="flex-1 bg-primary"
            >
              {currentStep === tutorialSteps.length - 1 ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Los geht's!
                </>
              ) : (
                <>
                  Weiter
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
