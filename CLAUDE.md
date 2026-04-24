# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

*   **Start Development Server:** `npm run dev`
*   **Build for Production:** `npm run build`
*   **Build for Development:** `npm run build:dev`
*   **Preview Production Build:** `npm run preview`
*   **Lint Code:** `npm run lint`
*   **Format Code:** `npm run format`

## High-Level Code Architecture

This project is a React application built with Vite and TypeScript. It leverages the following key technologies and patterns:

*   **Framework:** React
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **Routing:** Uses `@tanstack/react-router` for declarative, type-safe routing. Routes are defined in `src/routes/` and the router instance in `src/router.tsx`. `src/routeTree.gen.ts` is an auto-generated route tree.
*   **State Management & Data Fetching:** `@tanstack/react-query` is used for server state management, caching, and synchronization.
*   **UI Components:** Built using Radix UI primitives (`@radix-ui/react-*`) and extended with custom styled components in `src/components/ui`. Styling is managed with Tailwind CSS.
*   **Form Handling:** Implemented with `react-hook-form`, often paired with `zod` for schema validation through `@hookform/resolvers`.
*   **Application Logic:** Custom hooks are found in `src/hooks/` (e.g., `useAspirantes.ts`, `useEvaluacion.ts`), and utility functions reside in `src/lib/` (e.g., `scoring.ts`, `storage.ts`, `utils.ts`). Data definitions are in `src/data/`.
*   **Entry Points:** The main application entry is `src/main.tsx`, which renders the `App` component (`src/App.tsx`).
*   **Deployment Target:** The project is configured for deployment on Cloudflare Workers, indicated by the `@cloudflare/vite-plugin` dependency.
