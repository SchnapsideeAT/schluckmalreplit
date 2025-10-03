import { useEffect, useState } from "react";

export const SafeAreaDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({
    safeAreaTop: '0px',
    safeAreaBottom: '0px',
    safeAreaLeft: '0px',
    safeAreaRight: '0px',
    windowInnerHeight: 0,
    windowOuterHeight: 0,
    documentHeight: 0,
    viewportHeight: '0px',
    rootHeight: 0,
    bodyHeight: 0,
  });

  useEffect(() => {
    const updateDebugInfo = () => {
      const root = document.getElementById('root');
      const computedStyle = getComputedStyle(document.documentElement);
      
      setDebugInfo({
        safeAreaTop: computedStyle.getPropertyValue('--sat') || 
                     getComputedStyle(document.body).paddingTop || '0px',
        safeAreaBottom: computedStyle.getPropertyValue('--sab') || 
                        getComputedStyle(document.body).paddingBottom || '0px',
        safeAreaLeft: computedStyle.getPropertyValue('--sal') || '0px',
        safeAreaRight: computedStyle.getPropertyValue('--sar') || '0px',
        windowInnerHeight: window.innerHeight,
        windowOuterHeight: window.outerHeight,
        documentHeight: document.documentElement.scrollHeight,
        viewportHeight: `${window.innerHeight}px`,
        rootHeight: root?.scrollHeight || 0,
        bodyHeight: document.body.scrollHeight,
      });
    };

    // Initial update
    updateDebugInfo();

    // Update on resize
    window.addEventListener('resize', updateDebugInfo);
    window.addEventListener('orientationchange', updateDebugInfo);

    // Also try to get CSS env values directly
    const testDiv = document.createElement('div');
    testDiv.style.position = 'fixed';
    testDiv.style.top = '0';
    testDiv.style.left = '0';
    testDiv.style.width = '1px';
    testDiv.style.height = '1px';
    testDiv.style.paddingTop = 'env(safe-area-inset-top)';
    testDiv.style.paddingBottom = 'env(safe-area-inset-bottom)';
    testDiv.style.visibility = 'hidden';
    document.body.appendChild(testDiv);

    setTimeout(() => {
      const computed = getComputedStyle(testDiv);
      setDebugInfo(prev => ({
        ...prev,
        safeAreaTop: computed.paddingTop,
        safeAreaBottom: computed.paddingBottom,
      }));
      document.body.removeChild(testDiv);
    }, 100);

    return () => {
      window.removeEventListener('resize', updateDebugInfo);
      window.removeEventListener('orientationchange', updateDebugInfo);
    };
  }, []);

  return (
    <div
      className="fixed top-4 left-4 right-4 bg-black/95 text-white p-4 rounded-lg z-[9999] text-xs font-mono max-h-[80vh] overflow-y-auto"
      style={{ fontSize: '10px' }}
    >
      <h3 className="font-bold mb-2 text-yellow-400">🐛 Safe Area Debug Info</h3>
      <div className="space-y-1">
        <div className="text-green-400">Safe Area Insets:</div>
        <div>• Top: {debugInfo.safeAreaTop}</div>
        <div>• Bottom: {debugInfo.safeAreaBottom}</div>
        <div>• Left: {debugInfo.safeAreaLeft}</div>
        <div>• Right: {debugInfo.safeAreaRight}</div>
        
        <div className="text-blue-400 mt-2">Viewport Heights:</div>
        <div>• window.innerHeight: {debugInfo.windowInnerHeight}px</div>
        <div>• window.outerHeight: {debugInfo.windowOuterHeight}px</div>
        <div>• 100dvh computed: {debugInfo.viewportHeight}</div>
        
        <div className="text-purple-400 mt-2">Element Heights:</div>
        <div>• document.scrollHeight: {debugInfo.documentHeight}px</div>
        <div>• body.scrollHeight: {debugInfo.bodyHeight}px</div>
        <div>• #root.scrollHeight: {debugInfo.rootHeight}px</div>
        
        <div className="text-orange-400 mt-2">User Agent:</div>
        <div className="break-all">{navigator.userAgent}</div>
      </div>
    </div>
  );
};
