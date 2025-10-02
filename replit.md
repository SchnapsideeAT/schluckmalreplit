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
### Oct 2, 2025 - iOS Compatibility Improvements
- **Viewport Height Migration**: Changed all remaining `min-h-screen` (100vh) to `min-h-dvh` (100dvh) in Statistics.tsx, Index.tsx, NotFound.tsx, and ErrorBoundary.tsx for proper iOS viewport handling
- **ScrollableContainer Fix**: Made overflow-y: auto always active (previously only when detected), preventing scroll issues on iOS
- **Padding Optimization**: Removed duplicate padding (pb-20) from Rules.tsx and Settings.tsx to prevent gray areas at bottom on iOS
- **Swipe Interaction Fix**: Fixed button accessibility (Home/Settings) by using pointer-events strategy on GameCard wrapper
- **Safe Area Insets for ScrollableContainer**: Added Safe Area support for top/bottom (Notch, Dynamic Island, Home Indicator) with negative margin strategy to prevent double-padding from #root. Left/right intentionally without Safe Areas as requested.
- **Swipe Area Optimization**: Reduced GameCard swipe hitbox from fullscreen (`absolute inset-0`) to actual card dimensions for better visual clarity and intentional swipe interactions

### Oct 2, 2025 - iOS Safe Area Fix
- Fixed iPhone 15 Pro fullscreen issues (gray area at bottom, app not extending full height)
- Implemented CSS Safe Area Insets using `env(safe-area-inset-*)` variables
- Replaced all `100vh` with `100dvh` (dynamic viewport height) for iOS compatibility
- Added custom Tailwind utilities: `.min-h-dvh` and `.h-dvh`
- Updated critical components: Game, Home, InteractiveTutorial, Suspense fallback
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
