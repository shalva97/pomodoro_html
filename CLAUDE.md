# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Vite dev server (HMR, localhost:5173)
npm run build     # tsc -b && vite build (type-check + bundle)
npm run preview   # serve the production build locally
```

No lint script or test runner is configured.

## Architecture

Single-page React 18 app with two routes (`/` timer, `/stats`), built with Vite 5 and TypeScript 5.

**State** lives entirely in `src/store/timerContext.tsx` — a single `useReducer` inside a Context Provider. All timer logic (tick, pause, complete, mode transitions, settings) runs here. Sessions are persisted to `localStorage['pomo-sessions']`; settings to `localStorage['pomo-settings']`.

**Dark mode** is `useState` in `App.tsx`, written to `localStorage['pomo-theme']`, applied by toggling `.dark` on `<html>`. Components read it via `hooks/useIsDark.ts` (MutationObserver).

**Routing**: React Router DOM v6 `BrowserRouter` — `NavBar` uses `NavLink` with `end` on `/` for exact matching.

**Tailwind v4** (CSS-native): configured via `@import "tailwindcss"` in `src/index.css` and the `@tailwindcss/vite` plugin — there is no `tailwind.config.js`. Dark mode variant is set with `@variant dark (&:where(.dark *))` (class-based, not media-query).

**Ignore** the `webpack.common.js`, `webpack.config.*.js`, `js/`, and `css/` files in the root — they are HTML5 Boilerplate remnants from the original template and are not used by the React app.

## Key files

| File                         | Role                                                                                                   |
|------------------------------|--------------------------------------------------------------------------------------------------------|
| `src/store/timerContext.tsx` | All timer state, actions, side-effects (tick interval, notifications, session persist, document title) |
| `src/types.ts`               | Shared types: `TimerMode`, `TimerSettings`, `Session`, `DayStats`                                      |
| `src/hooks/useStats.ts`      | Reads `pomo-sessions` from localStorage; derives weekly data, streak, totals                           |
| `src/pages/TimerPage.tsx`    | Main timer UI + Space-bar keyboard shortcut                                                            |
| `src/pages/StatsPage.tsx`    | Weekly bar chart (div heights) + stat cards                                                            |
