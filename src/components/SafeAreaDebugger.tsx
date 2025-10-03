import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "@/hooks/useSafeAreaInsets";

interface KeyboardTrackingEvent {
  type: 'open' | 'close';
  timestamp: number;
  innerHeight: number;
  visualViewportHeight: number;
  diff: number;
}

export const SafeAreaDebugger = () => {
  const { insets, debugInfo } = useSafeAreaInsets();
  const [keyboardEvents, setKeyboardEvents] = useState<KeyboardTrackingEvent[]>([]);
  const [liveHeight, setLiveHeight] = useState(window.innerHeight);
  const [liveVisualHeight, setLiveVisualHeight] = useState(
    window.visualViewport?.height || window.innerHeight
  );
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [containerHeights, setContainerHeights] = useState({
    vh100: 0,
    dvh100: 0,
    setupContainer: 0,
  });

  // Track keyboard events and viewport changes
  useEffect(() => {
    let lastHeight = window.innerHeight;
    let lastVisualHeight = window.visualViewport?.height || window.innerHeight;

    const updateHeights = () => {
      const currentHeight = window.innerHeight;
      const currentVisualHeight = window.visualViewport?.height || window.innerHeight;
      
      setLiveHeight(currentHeight);
      setLiveVisualHeight(currentVisualHeight);

      // Detect keyboard open/close based on height changes
      const heightDiff = lastHeight - currentHeight;
      if (heightDiff > 100) {
        // Keyboard likely opened
        setIsKeyboardOpen(true);
        setKeyboardEvents(prev => [...prev, {
          type: 'open' as const,
          timestamp: Date.now(),
          innerHeight: currentHeight,
          visualViewportHeight: currentVisualHeight,
          diff: heightDiff
        }].slice(-5)); // Keep last 5 events
      } else if (heightDiff < -100) {
        // Keyboard likely closed
        setIsKeyboardOpen(false);
        setKeyboardEvents(prev => [...prev, {
          type: 'close' as const,
          timestamp: Date.now(),
          innerHeight: currentHeight,
          visualViewportHeight: currentVisualHeight,
          diff: heightDiff
        }].slice(-5));
      }

      lastHeight = currentHeight;
      lastVisualHeight = currentVisualHeight;
    };

    // Measure container heights
    const measureContainers = () => {
      // Create temporary elements to measure vh and dvh
      const vh100Elem = document.createElement('div');
      vh100Elem.style.cssText = 'position: fixed; height: 100vh; width: 1px; visibility: hidden;';
      document.body.appendChild(vh100Elem);
      
      const dvh100Elem = document.createElement('div');
      dvh100Elem.style.cssText = 'position: fixed; height: 100dvh; width: 1px; visibility: hidden;';
      document.body.appendChild(dvh100Elem);

      const vh100Height = vh100Elem.offsetHeight;
      const dvh100Height = dvh100Elem.offsetHeight;

      document.body.removeChild(vh100Elem);
      document.body.removeChild(dvh100Elem);

      // Try to find Setup container
      const setupContainerHeight = document.querySelector('.h-dvh')?.clientHeight || 0;

      setContainerHeights({
        vh100: vh100Height,
        dvh100: dvh100Height,
        setupContainer: setupContainerHeight,
      });
    };

    // Listen to various events
    const onResize = () => {
      updateHeights();
      measureContainers();
    };

    const onVisualViewportResize = () => {
      updateHeights();
      measureContainers();
    };

    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        console.log('🎹 Keyboard detected (focusin)', {
          innerHeight: window.innerHeight,
          visualViewport: window.visualViewport?.height,
        });
        setTimeout(() => {
          updateHeights();
          measureContainers();
        }, 300); // Delay to let keyboard fully open
      }
    };

    const onFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        console.log('🎹 Keyboard closed (focusout)', {
          innerHeight: window.innerHeight,
          visualViewport: window.visualViewport?.height,
        });
        setTimeout(() => {
          updateHeights();
          measureContainers();
        }, 300); // Delay to let keyboard fully close
      }
    };

    // Initial measurement
    measureContainers();

    // Add listeners
    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('resize', onVisualViewportResize);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);

    return () => {
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onVisualViewportResize);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  if (!debugInfo) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[10000] bg-yellow-500 text-black p-4 text-xs">
        <div className="font-bold mb-2">⏳ Debug Info wird geladen...</div>
      </div>
    );
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[10000] bg-yellow-500 text-black p-3 text-xs overflow-y-auto max-h-[70vh]">
      <div className="font-bold text-sm mb-2 border-b border-black pb-1">
        🐛 Tastatur & Layout Debug Tool
      </div>

      {/* CRITICAL: Keyboard Status */}
      <div className={`mb-3 p-3 rounded border-4 border-black ${isKeyboardOpen ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
        <div className="font-bold text-base mb-2">
          🎹 TASTATUR STATUS:
        </div>
        <div className="text-lg font-bold">
          {isKeyboardOpen ? '🔴 OFFEN' : '✅ GESCHLOSSEN'}
        </div>
      </div>

      {/* Live Viewport Tracking */}
      <div className="mb-3 bg-white/90 p-3 rounded border-2 border-blue-500">
        <div className="font-bold mb-2 text-blue-700">📊 LIVE VIEWPORT TRACKING:</div>
        <div className="space-y-1">
          <div>
            <span className="font-bold">window.innerHeight:</span>{' '}
            <span className="font-mono bg-blue-200 px-2 py-1 rounded">{liveHeight}px</span>
          </div>
          <div>
            <span className="font-bold">visualViewport.height:</span>{' '}
            <span className="font-mono bg-blue-200 px-2 py-1 rounded">{liveVisualHeight}px</span>
          </div>
          <div>
            <span className="font-bold">Differenz:</span>{' '}
            <span className="font-mono bg-orange-200 px-2 py-1 rounded">{liveHeight - liveVisualHeight}px</span>
          </div>
        </div>
      </div>

      {/* 100vh vs 100dvh Comparison */}
      <div className="mb-3 bg-white/90 p-3 rounded border-2 border-purple-500">
        <div className="font-bold mb-2 text-purple-700">📐 100vh vs 100dvh VERGLEICH:</div>
        <div className="space-y-1">
          <div>
            <span className="font-bold">100vh (statisch):</span>{' '}
            <span className="font-mono bg-purple-200 px-2 py-1 rounded">{containerHeights.vh100}px</span>
          </div>
          <div>
            <span className="font-bold">100dvh (dynamisch):</span>{' '}
            <span className="font-mono bg-purple-200 px-2 py-1 rounded">{containerHeights.dvh100}px</span>
          </div>
          <div>
            <span className="font-bold">Unterschied:</span>{' '}
            <span className={`font-mono px-2 py-1 rounded ${containerHeights.vh100 !== containerHeights.dvh100 ? 'bg-red-300 font-bold' : 'bg-green-300'}`}>
              {containerHeights.vh100 - containerHeights.dvh100}px
            </span>
          </div>
          {containerHeights.setupContainer > 0 && (
            <div className="mt-2 pt-2 border-t border-purple-300">
              <span className="font-bold">Setup Container (.h-dvh):</span>{' '}
              <span className="font-mono bg-green-200 px-2 py-1 rounded">{containerHeights.setupContainer}px</span>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard Events History */}
      {keyboardEvents.length > 0 && (
        <div className="mb-3 bg-white/90 p-3 rounded border-2 border-orange-500">
          <div className="font-bold mb-2 text-orange-700">📝 TASTATUR EVENTS (letzte 5):</div>
          <div className="space-y-1">
            {keyboardEvents.map((event, idx) => (
              <div key={idx} className={`text-[10px] p-1 rounded ${event.type === 'open' ? 'bg-red-100' : 'bg-green-100'}`}>
                <span className="font-bold">{event.type === 'open' ? '🔴 ÖFFNEN' : '✅ SCHLIEẞEN'}</span>
                {' @ '}
                <span className="font-mono">{formatTime(event.timestamp)}</span>
                {' | innerH: '}
                <span className="font-mono">{event.innerHeight}px</span>
                {' | visualH: '}
                <span className="font-mono">{event.visualViewportHeight}px</span>
                {' | Δ: '}
                <span className="font-mono font-bold">{Math.abs(event.diff)}px</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CRITICAL: Capacitor Detection */}
      <div className="mb-3 bg-red-500 text-white p-3 rounded border-4 border-black">
        <div className="font-bold text-base mb-2">🚨 CAPACITOR DEBUG:</div>
        <div className="space-y-1">
          <div>
            <span className="font-bold">Capacitor Native?</span>{' '}
            <span className={`font-mono px-2 py-1 rounded ${debugInfo.isCapacitorNative ? 'bg-green-300 text-black' : 'bg-red-300 text-black'}`}>
              {debugInfo.isCapacitorNative ? '✅ JA' : '❌ NEIN'}
            </span>
          </div>
          <div>
            <span className="font-bold">Höhen-Differenz:</span>{' '}
            <span className="font-mono bg-yellow-300 text-black px-2 py-1 rounded">
              {debugInfo.heightDiff}px
            </span>
          </div>
          <div>
            <span className="font-bold">Bottom von Capacitor verwaltet?</span>{' '}
            <span className={`font-mono px-2 py-1 rounded ${debugInfo.capacitorManagedBottom ? 'bg-green-300 text-black' : 'bg-red-300 text-black'}`}>
              {debugInfo.capacitorManagedBottom ? '✅ JA (bottom=0)' : '❌ NEIN (bottom=34px)'}
            </span>
          </div>
        </div>
      </div>

      {/* CSS env() Values */}
      <div className="mb-3 bg-white/80 p-2 rounded">
        <div className="font-bold mb-1">📐 CSS env() Raw Values:</div>
        <div className="grid grid-cols-2 gap-1">
          <div>Top: <span className="font-mono bg-gray-200 px-1">{debugInfo.cssEnvValues.top || '(empty)'}</span></div>
          <div>Bottom: <span className="font-mono bg-gray-200 px-1">{debugInfo.cssEnvValues.bottom || '(empty)'}</span></div>
          <div>Left: <span className="font-mono bg-gray-200 px-1">{debugInfo.cssEnvValues.left || '(empty)'}</span></div>
          <div>Right: <span className="font-mono bg-gray-200 px-1">{debugInfo.cssEnvValues.right || '(empty)'}</span></div>
        </div>
        <div className="mt-1 font-bold">
          Status: <span className={debugInfo.hasCSSValues ? "text-green-700" : "text-red-700"}>
            {debugInfo.hasCSSValues ? '✅ CSS env() funktioniert' : '❌ CSS env() leer → JS Fallback'}
          </span>
        </div>
      </div>

      {/* Calculated Insets */}
      <div className="mb-3 bg-white/80 p-2 rounded">
        <div className="font-bold mb-1">🎯 Berechnete Safe Area Insets:</div>
        <div className="grid grid-cols-2 gap-1">
          <div>Top: <span className="font-mono bg-green-200 px-1">{insets.top}</span></div>
          <div>Bottom: <span className={`font-mono px-1 ${insets.bottom === '0px' ? 'bg-red-300 font-bold' : 'bg-green-200'}`}>{insets.bottom}</span></div>
          <div>Left: <span className="font-mono bg-green-200 px-1">{insets.left}</span></div>
          <div>Right: <span className="font-mono bg-green-200 px-1">{insets.right}</span></div>
        </div>
      </div>

      {/* Device Detection */}
      <div className="mb-3 bg-white/80 p-2 rounded">
        <div className="font-bold mb-1">📱 Device Info:</div>
        <div>iOS: <span className="font-bold">{debugInfo.isIOS ? '✅ Ja' : '❌ Nein'}</span></div>
        <div>Notch/Dynamic Island: <span className="font-bold">{debugInfo.hasNotch ? '✅ Ja (iPhone X+)' : '❌ Nein'}</span></div>
        <div>Orientation: <span className="font-bold">{debugInfo.isPortrait ? '📱 Portrait' : '📐 Landscape'}</span></div>
      </div>

      {/* Viewport Info */}
      <div className="mb-3 bg-white/80 p-2 rounded">
        <div className="font-bold mb-1">📏 Viewport & Screen:</div>
        <div>window.innerHeight: <span className="font-mono bg-blue-200 px-1">{debugInfo.windowHeight}px</span></div>
        <div>screen.height: <span className="font-mono bg-blue-200 px-1">{debugInfo.screenHeight}px</span></div>
        <div>window.innerWidth: <span className="font-mono bg-blue-200 px-1">{debugInfo.windowWidth}px</span></div>
        <div>screen.width: <span className="font-mono bg-blue-200 px-1">{debugInfo.screenWidth}px</span></div>
        <div className="mt-1">
          Diff (screen - window): <span className="font-mono bg-orange-200 px-1">
            {debugInfo.screenHeight - debugInfo.windowHeight}px height, {debugInfo.screenWidth - debugInfo.windowWidth}px width
          </span>
        </div>
      </div>

      {/* User Agent */}
      <div className="bg-white/80 p-2 rounded">
        <div className="font-bold mb-1">🔍 User Agent:</div>
        <div className="font-mono text-[10px] break-all">{debugInfo.userAgent}</div>
      </div>

      {/* Visual Indicators Info */}
      <div className="mt-3 bg-red-500 text-white p-2 rounded">
        <div className="font-bold">🎨 Visuelle Markierungen aktiv:</div>
        <div>🔴 #root → roter Rahmen</div>
        <div>🔵 .h-screen / .min-h-screen → blauer Rahmen</div>
        <div>🟢 Container → grüner Rahmen</div>
      </div>

      {/* Instructions */}
      <div className="mt-3 bg-blue-500 text-white p-2 rounded">
        <div className="font-bold mb-1">📖 ANLEITUNG:</div>
        <div className="text-[10px]">
          1. Tippe ein Textfeld an<br/>
          2. Beobachte "TASTATUR STATUS" (sollte ROT werden)<br/>
          3. Beobachte "100vh vs 100dvh" Unterschied<br/>
          4. Beobachte "LIVE VIEWPORT TRACKING"<br/>
          5. Schließe Tastatur → alles sollte grün werden<br/>
          6. Screenshot machen und teilen! 📸
        </div>
      </div>
    </div>
  );
};
