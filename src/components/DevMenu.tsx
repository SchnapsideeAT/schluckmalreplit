import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSafeAreaInsets } from "@/hooks/useSafeAreaInsets";

interface DevMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper to parse CSS values like "max(1rem, 59px)" or "34px" to numbers
const parseCSSValue = (cssValue: string): number => {
  // Extract all pixel values from the string
  const pxMatches = cssValue.match(/(\d+(?:\.\d+)?)px/g);
  if (pxMatches && pxMatches.length > 0) {
    // Get the last (largest) pixel value from max() function
    const values = pxMatches.map(m => parseFloat(m));
    return Math.max(...values);
  }
  
  // Check for rem values (1rem = 16px typically)
  const remMatch = cssValue.match(/(\d+(?:\.\d+)?)rem/);
  if (remMatch) {
    return parseFloat(remMatch[1]) * 16;
  }
  
  // Try direct number parsing as fallback
  const num = parseFloat(cssValue);
  return isNaN(num) ? 0 : num;
};

export const DevMenu = ({ isOpen, onClose }: DevMenuProps) => {
  const { insets } = useSafeAreaInsets();
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  if (!isOpen) return null;

  const headerHeight = 48; // 0.5rem padding + 40px button
  const topInsetPx = parseCSSValue(insets.top);
  const bottomInsetPx = parseCSSValue(insets.bottom);
  const topConsumed = topInsetPx + headerHeight;
  const bottomConsumed = topInsetPx + headerHeight; // Match top for perfect centering
  const availableHeight = viewport.height - topConsumed - bottomConsumed;
  const totalConsumed = topConsumed + bottomConsumed;

  return (
    <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4">
      <div className="bg-card border border-primary/30 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">🛠️ Dev Menu</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 text-sm">
          {/* Viewport Info */}
          <div className="bg-muted/50 p-3 rounded">
            <h3 className="font-semibold mb-2 text-primary">📱 Viewport</h3>
            <div className="space-y-1 font-mono">
              <div>Width: {viewport.width}px</div>
              <div>Height: {viewport.height}px</div>
            </div>
          </div>

          {/* Safe Area Insets */}
          <div className="bg-muted/50 p-3 rounded">
            <h3 className="font-semibold mb-2 text-primary">🛡️ Safe Area Insets</h3>
            <div className="space-y-1 font-mono">
              <div>Top: {insets.top}px</div>
              <div>Bottom: {insets.bottom}px</div>
              <div>Left: {insets.left}px</div>
              <div>Right: {insets.right}px</div>
            </div>
          </div>

          {/* Layout Calculations */}
          <div className="bg-muted/50 p-3 rounded">
            <h3 className="font-semibold mb-2 text-primary">📐 Layout Berechnungen</h3>
            <div className="space-y-1 font-mono">
              <div className="text-yellow-500">Oben:</div>
              <div className="ml-4">Safe Area Top: {topInsetPx}px</div>
              <div className="ml-4">Header: {headerHeight}px</div>
              <div className="ml-4 font-bold">= Gesamt: {topConsumed.toFixed(1)}px</div>
              
              <div className="text-yellow-500 mt-2">Unten (für Zentrierung):</div>
              <div className="ml-4">= Safe Area Top + Header</div>
              <div className="ml-4">= {topInsetPx}px + {headerHeight}px</div>
              <div className="ml-4 font-bold">= Gesamt: {bottomConsumed.toFixed(1)}px</div>
              
              <div className="text-green-500 mt-2">Verfügbar:</div>
              <div className="ml-4 font-bold">{availableHeight.toFixed(1)}px</div>
              
              <div className="text-red-500 mt-2">Differenz (Oben - Unten):</div>
              <div className="ml-4 font-bold">{(topConsumed - bottomConsumed).toFixed(1)}px</div>
            </div>
          </div>

          {/* Container Info */}
          <div className="bg-muted/50 p-3 rounded">
            <h3 className="font-semibold mb-2 text-primary">📦 Container</h3>
            <div className="space-y-1 font-mono">
              <div>h-screen: {viewport.height}px</div>
              <div>Consumed: {totalConsumed}px</div>
              <div>Card Area (flex-1): {availableHeight}px</div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-500/20 border border-blue-500/50 p-3 rounded">
            <h3 className="font-semibold mb-2 text-blue-400">💡 Info</h3>
            <div className="text-xs space-y-1">
              <div>Für perfekte Zentrierung sollte Oben = Unten sein</div>
              <div className="mt-2">Aktuell: Oben {topConsumed}px, Unten {bottomConsumed}px</div>
              {topConsumed !== bottomConsumed && (
                <div className="text-yellow-400 mt-2">
                  ⚠️ Asymmetrie von {Math.abs(topConsumed - bottomConsumed)}px
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
