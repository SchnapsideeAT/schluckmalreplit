import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { SettingsIcon } from "@/components/icons/SettingsIcon";
import { LoadGameIcon } from "@/components/icons/LoadGameIcon";
import { RulesIcon } from "@/components/icons/RulesIcon";
import logo from "@/assets/logo.svg";
import { playSound } from "@/utils/sounds";
import { loadGameState } from "@/utils/localStorage";
import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import { useSafeAreaInsets } from "@/hooks/useSafeAreaInsets";

const Home = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { insets } = useSafeAreaInsets();
  const [hasSavedGame, setHasSavedGame] = useState(false);
  
  useEffect(() => {
    const savedState = loadGameState();
    setHasSavedGame(savedState !== null);
  }, []);

  const handleStartGame = () => {
    playSound('success', settings.soundEnabled);
    navigate("/setup");
  };

  const handleLoadGame = () => {
    const savedState = loadGameState();
    if (savedState) {
      playSound('success', settings.soundEnabled);
      navigate("/game", { 
        state: {
          players: savedState.players,
          deck: savedState.deck,
          currentIndex: savedState.currentIndex,
          currentPlayerIndex: savedState.currentPlayerIndex,
          cardAccepted: savedState.cardAccepted
        }
      });
    }
  };
  
  return (
    <div 
      className="no-scroll h-screen flex flex-col items-center justify-center relative"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        boxSizing: 'border-box',
      }}
    >
      <div className="responsive-container space-y-6 mb-8">
        <div className="flex justify-center px-4">
          <img 
            src={logo} 
            alt="Schluck mal!" 
            className="logo-final-position w-full max-w-[280px] sm:max-w-md h-auto"
          />
        </div>
      </div>

      <div className="responsive-container space-y-4 sm:space-y-4 text-center relative z-10">
        <div className="space-y-4">
          {hasSavedGame && (
            <Button 
              onClick={handleLoadGame} 
              size="lg" 
              className="buttons-hidden buttons-appear button-stagger-1 w-full min-h-[56px] sm:h-16 text-base sm:text-lg bg-accent hover:shadow-[var(--shadow-button)] transition-all duration-300 hover:scale-105 touch-manipulation"
            >
              <LoadGameIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              Spiel laden
            </Button>
          )}
          
          <Button 
            onClick={handleStartGame} 
            size="lg" 
            className={`buttons-hidden buttons-appear ${hasSavedGame ? 'button-stagger-2' : 'button-stagger-1'} w-full min-h-[56px] sm:h-16 text-base sm:text-lg bg-primary hover:shadow-[var(--shadow-button)] transition-all duration-300 hover:scale-105 touch-manipulation`}
          >
            <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
            Spiel starten
          </Button>

          <Button 
            onClick={() => navigate("/rules")} 
            variant="outline" 
            size="lg" 
            className={`buttons-hidden buttons-appear ${hasSavedGame ? 'button-stagger-3' : 'button-stagger-2'} w-full min-h-[52px] sm:h-14 text-base sm:text-lg border-2 border-primary/50 hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-300 hover:scale-[1.02] active:scale-95 touch-manipulation`}
          >
            <RulesIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
            Regeln
          </Button>

          <Button 
            onClick={() => navigate("/settings")} 
            variant="outline" 
            size="lg" 
            className={`buttons-hidden buttons-appear ${hasSavedGame ? 'button-stagger-4' : 'button-stagger-3'} w-full min-h-[52px] sm:h-14 text-base sm:text-lg border-2 border-secondary/50 hover:bg-secondary/10 hover:border-secondary hover:text-foreground transition-all duration-300 hover:scale-[1.02] active:scale-95 touch-manipulation`}
          >
            <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
            Einstellungen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
