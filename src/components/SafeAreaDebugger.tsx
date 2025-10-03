import { useSafeAreaInsets } from "@/hooks/useSafeAreaInsets";

export const SafeAreaDebugger = () => {
  const { insets, debugInfo } = useSafeAreaInsets();

  if (!debugInfo) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[10000] bg-yellow-500 text-black p-4 text-xs">
        <div className="font-bold mb-2">⏳ Debug Info wird geladen...</div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[10000] bg-yellow-500 text-black p-3 text-xs overflow-y-auto max-h-[50vh]">
      <div className="font-bold text-sm mb-2 border-b border-black pb-1">
        🐛 Safe Area Debug Tool
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

      {/* CRITICAL: Capacitor Detection */}
      <div className="mb-3 bg-red-500 text-white p-3 rounded border-4 border-black">
        <div className="font-bold text-base mb-2">🚨 CAPACITOR DEBUG (KRITISCH!):</div>
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
    </div>
  );
};
