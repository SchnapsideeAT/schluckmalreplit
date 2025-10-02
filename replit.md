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
### Oct 2, 2025 - Mobile Optimization (iOS & Android)
**iOS Safe Area Fix:**
- Fixed iPhone 15 Pro fullscreen issues (gray area at bottom, app not extending full height)
- Implemented CSS Safe Area Insets using `env(safe-area-inset-*)` variables
- Replaced all `100vh` with `100dvh` (dynamic viewport height) for iOS compatibility
- Added custom Tailwind utilities: `.min-h-dvh` and `.h-dvh`
- Updated critical components: Game, Home, InteractiveTutorial, Suspense fallback
- Configured Capacitor iOS with `contentInset: 'always'`
- Installed and configured `@capacitor/status-bar` plugin with overlay mode
- Created `src/utils/capacitor-init.ts` for Status Bar initialization

**Card Size Optimization:**
- Optimized GameCard sizing for all mobile devices (iPhone SE to Pro Max, Android small to large)
- Reduced Game.tsx layout padding (px-3 pt-4 pb-16) for maximum card display area
- Card sizes: 75-80% viewport height, 86-88% viewport width on mobile
- Cards properly sized accounting for Safe Areas and layout constraints
- InteractiveTutorial card sizes synchronized with GameCard (same breakpoints)

**Safe Area Improvements:**
- ScrollableContainer now includes safe-area-inset-top for proper content positioning
- InteractiveTutorial progress indicator and skip button positioned with safe area offsets
- All pages (Settings, Rules, Tutorial) now respect top and bottom safe areas
- Verified on iPhone 13/14/15, Pro Max, and Android devices

### Oct 1, 2025
- Imported from GitHub
- Configured for Replit environment
- Updated Vite config to use port 5000 and allow Replit hosts
- Set up deployment configuration
- Configured workflow for development server
- Removed old dialog-based tutorial, kept only Interactive Tutorial with swipe gestures
