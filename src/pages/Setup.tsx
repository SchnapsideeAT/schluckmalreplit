import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";
import { PlayerSetup } from "@/components/PlayerSetup";
import { CategorySelector } from "@/components/CategorySelector";
import { Player, CardCategory } from "@/types/card";
import { playSound } from "@/utils/sounds";
import { loadLastPlayers, loadLastCategories, hasShownInteractiveTutorial } from "@/utils/localStorage";
import { useSettings } from "@/hooks/useSettings";
import { useSafeAreaInsets } from "@/hooks/useSafeAreaInsets";
import { useSmartHeight } from "@/hooks/useSmartHeight";
import { SafeAreaDebugger } from "@/components/SafeAreaDebugger";

const Setup = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { insets } = useSafeAreaInsets();
  const smartHeight = useSmartHeight();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<CardCategory[]>([
    "Wahrheit",
    "Aufgabe",
    "Gruppe",
    "Duell",
    "Wildcard"
  ]);
  const [showDebug, setShowDebug] = useState(false);

  // Load last players and categories on mount
  useEffect(() => {
    const lastPlayers = loadLastPlayers();
    const lastCategories = loadLastCategories();
    
    if (lastPlayers && lastPlayers.length > 0) {
      setPlayers(lastPlayers);
    }
    
    if (lastCategories && lastCategories.length > 0) {
      setSelectedCategories(lastCategories);
    }
  }, []);

  return (
    <div
      className="flex flex-col overflow-y-auto bg-background"
      style={{
        height: `${smartHeight}px`,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        boxSizing: 'border-box',
      }}
    >
      {/* Debug Tool */}
      {showDebug && <SafeAreaDebugger />}

      {/* Debug Toggle Button */}
      <button
        onClick={() => {
          setShowDebug(!showDebug);
          if (!showDebug) {
            document.body.classList.add('debug-mode');
          } else {
            document.body.classList.remove('debug-mode');
          }
        }}
        className="fixed bottom-4 right-4 z-[10001] bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-bold shadow-lg"
        data-testid="button-debug-toggle"
      >
        🐛 {showDebug ? 'Hide' : 'Show'} Debug
      </button>

      <div className="max-w-lg mx-auto space-y-8 text-center slide-up">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 border border-primary/50 mb-4">
              <Users className="w-10 h-10 text-primary" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Spielvorbereitung
            </h1>
          </div>


          {/* Category Selector */}
          <CategorySelector 
            selectedCategories={selectedCategories}
            onCategoriesChange={setSelectedCategories}
          />

          {/* Player Setup Component */}
          <PlayerSetup players={players} onPlayersChange={setPlayers} />

          {/* Start button */}
          <Button
            onClick={() => {
              if (players.length < 2) {
                playSound('error', settings.soundEnabled);
                return;
              }
              if (selectedCategories.length === 0) {
                playSound('error', settings.soundEnabled);
                return;
              }
              playSound('success', settings.soundEnabled);
              
              // Navigate to tutorial if not shown, otherwise go directly to game
              const targetRoute = hasShownInteractiveTutorial() ? "/game" : "/tutorial";
              navigate(targetRoute, { state: { players, selectedCategories } });
            }}
            size="lg"
            className="w-full h-16 text-lg bg-primary hover:shadow-[var(--shadow-button)] transition-all duration-300 hover:scale-105"
          >
            Los geht's!
            <ArrowRight className="w-6 h-6 ml-3" />
          </Button>

          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="w-full hover:text-primary hover:bg-transparent"
          >
            Zurück
          </Button>
      </div>
    </div>
  );
};

export default Setup;
