# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server (HMR)
- `npm run build` — typecheck via `tsc -b` then production build via `vite build`
- `npm run preview` — serve the production build locally
- `npm test` — run tests once (Vitest)
- `npm run test:watch` — Vitest in watch mode
- `npx vitest run src/app.test.tsx` — run a single test file

No linter configured yet. No `npm install` needed if `node_modules` already present.

## Testing

Vitest + `@testing-library/preact` + jsdom, configured inline in `vite.config.ts` (`test` field). Setup file `src/test/setup.ts` registers `@testing-library/jest-dom` matchers and RTL's `cleanup` after each test. Test files live next to source as `*.test.tsx`.

## Architecture

Minimal Preact + TypeScript + Vite scaffold (from `create-vite` preact-ts template).

- `index.html` → `src/main.tsx` mounts `<App />` (from `src/app.tsx`) into `#app`.
- `src/app.tsx` is the sole component — everything currently lives here (no router, no state library, no component directory yet).
- Path aliases in `tsconfig.app.json` map `react`/`react-dom` imports to `preact/compat`, so React-ecosystem libraries expecting those imports work under Preact.
- JSX uses Preact's automatic runtime (`jsxImportSource: "preact"`), so no manual `h` import needed.
- TypeScript project is split via references: `tsconfig.json` (root) → `tsconfig.app.json` (src, app code) + `tsconfig.node.json` (Vite config). Build with `tsc -b`, not plain `tsc`.
- Static assets referencing `/icons.svg#<id>` (via `<use>`) are served from `public/`; imported assets (`hero.png`, logos) live in `src/assets/`.
