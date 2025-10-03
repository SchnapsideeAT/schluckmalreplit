# Schluck Mal - Game Application

## Overview
This is a React-based card game application called "Schluck Mal" (German drinking game). It's a frontend-only single-page application built with Vite, React, TypeScript, and shadcn/ui components.

## Project Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Routing**: React Router v6
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **Mobile Support**: Capacitor (for iOS/Android apps)
- **State Management**: React Query (TanStack Query)
- **Storage**: IndexedDB (idb) and Capacitor Preferences for mobile

## Key Technologies
- Vite with SWC for fast builds
- React Router for client-side routing
- Lazy loading for optimal performance
- Canvas Confetti for animations
- Lucide React icons
- Form handling with react-hook-form
- Zod for validation

## Development Setup
- Port: 5000 (configured for Replit)
- Host: 0.0.0.0 (allows Replit proxy)
- Dev command: `npm run dev`
- Build command: `npm run build`

## Deployment
- Type: Autoscale (static site)
- Build: `npm run build`
- No backend server required

## Project Structure
- `/src/pages` - Route pages (Home, Game, Setup, Rules, etc.)
- `/src/components` - Reusable components including UI library
- `/src/hooks` - Custom React hooks
- `/src/utils` - Utility functions
- `/src/data` - Static data (cards.json)
- `/public` - Static assets

## Recent Changes
### Oct 3, 2025 - JavaScript-Based Safe Area System (iOS 26 Fix)
- **Critical Fix**: Replaced CSS `env(safe-area-inset-*)` with JavaScript-based detection due to iOS 26 bug where CSS env() returns empty values
- **Created useSafeAreaInsets Hook**: Progressive enhancement approach - tests CSS env() first, falls back to JS calculations on iOS when needed
- **Universal Update**: Updated all 9 pages (Home, Game, Statistics, Setup, Rules, Settings, InteractiveTutorial, Index, NotFound) and ScrollableContainer component to use the hook
- **Removed Debug Tools**: Cleaned up SafeAreaDebugger component, debug buttons, debug CSS, and keyboard shortcuts
- **Device Detection**: Hook intelligently detects iOS devices, notched phones (iPhone X+), and orientation to calculate appropriate Safe Area insets
- **Fallback Strategy**: On devices where CSS env() fails, uses device-specific pixel values (44px top for notch in portrait, 34px bottom for home indicator, etc.)

### Oct 2, 2025 - iOS Compatibility Improvements
- **Viewport Height Migration**: Changed all remaining `min-h-screen` (100vh) to `min-h-dvh` (100dvh) in Statistics.tsx, Index.tsx, NotFound.tsx, and ErrorBoundary.tsx for proper iOS viewport handling
- **ScrollableContainer Fix**: Made overflow-y: auto always active (previously only when detected), preventing scroll issues on iOS
- **Padding Optimization**: Removed duplicate padding (pb-20) from Rules.tsx and Settings.tsx to prevent gray areas at bottom on iOS
- **Swipe Interaction Fix**: Fixed button accessibility (Home/Settings) by using pointer-events strategy on GameCard wrapper
- **Tutorial Card Size Fix**: Rebuilt tutorial card system with exact GameCard sizing logic (58%×75%, 60%×78%, 62%×80%, 65%×50%) to ensure identical card dimensions between tutorial and game. Uses same responsive breakpoints and inline-block structure as GameCard.

### Oct 2, 2025 - Initial iOS Safe Area Attempt (Superseded by Oct 3 JS-based fix)
- Fixed iPhone 15 Pro fullscreen issues (gray area at bottom, app not extending full height)
- Attempted CSS Safe Area Insets using `env(safe-area-inset-*)` variables (later found non-functional on iOS 26)
- Replaced all `100vh` with `100dvh` (dynamic viewport height) for iOS compatibility
- Added custom Tailwind utilities: `.min-h-dvh` and `.h-dvh`
- Configured Capacitor iOS with `contentInset: 'always'`
- Installed and configured `@capacitor/status-bar` plugin with overlay mode
- Created `src/utils/capacitor-init.ts` for Status Bar initialization

### Oct 1, 2025
- Imported from GitHub
- Configured for Replit environment
- Updated Vite config to use port 5000 and allow Replit hosts
- Set up deployment configuration
- Configured workflow for development server
- Removed old dialog-based tutorial, kept only Interactive Tutorial with swipe gestures
