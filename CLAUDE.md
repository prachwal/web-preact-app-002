# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server (HMR)
- `npm run build` — typecheck via `tsc -b` then production build via `vite build` (builds both `index.html` and `playground.html`, see below)
- `npm run preview` — serve the production build locally
- `npm test` — run tests once (Vitest)
- `npm run test:watch` — Vitest in watch mode
- `npx vitest run src/app.test.tsx` — run a single test file

No linter configured yet. No `npm install` needed if `node_modules` already present.

## Testing

Vitest + `@testing-library/preact` + jsdom, configured inline in `vite.config.ts` (`test` field). Setup file `src/test/setup.ts` registers `@testing-library/jest-dom` matchers and RTL's `cleanup` after each test. Test files live next to source as `*.test.tsx`.

## Architecture

Preact + TypeScript + Vite app with two parts: the hero page (`src/app.tsx`) and an in-progress, folder-isolated component system under `src/ui/`.

- `index.html` → `src/main.tsx` mounts `<App />` (`src/app.tsx`) — the hero page, styled by `src/app.scss` on top of the reset/tokens in `src/styles/`.
- `playground.html` → `src/playground-main.tsx` mounts `<Playground />` (`@ui/playground/Playground`) — a visual gallery of every `src/ui` component, used to eyeball changes without touching the real app. Both HTML entries are wired into `vite.config.ts`'s `build.rollupOptions.input`, so `npm run build` emits both.
- JSX uses Preact's automatic runtime (`jsxImportSource: "preact"`), so no manual `h` import needed.
- TypeScript project is split via references: `tsconfig.json` (root) → `tsconfig.app.json` (src, app code) + `tsconfig.node.json` (Vite config). Build with `tsc -b`, not plain `tsc`.
- Styling is SCSS throughout (`sass` devDependency). App-level tokens live in `src/styles/_tokens.scss`; the `src/ui` component system has its own, separate token layer (see below) — the two don't share CSS variable names on purpose, so the component system stays extractable.

### Import aliases

`tsconfig.app.json`'s `paths` and `vite.config.ts`'s `resolve.alias` both define (keep them in sync by hand — no `vite-tsconfig-paths` dependency):

- `@ui/*` → `src/ui/*` — use for any import that crosses into the component system from outside it, and inside `src/ui` itself for anything not in the same directory (e.g. `@ui/utils/cx`, never `../../utils/cx`).
- `@/*` → `src/*` — general app-root alias.
- `react`/`react-dom` still map to `preact/compat` (unrelated alias, needed so React-ecosystem libraries work under Preact).

Only same-directory imports (`./Box.module.scss`, `./Box.types`) stay relative.

### Preact TypeScript types

Import `HTMLAttributes`, `ButtonHTMLAttributes`, `CSSProperties`, etc. directly from `'preact'` — not `JSX.HTMLAttributes`/`JSX.CSSProperties`. The `JSX.*` aliases are `@deprecated` in Preact's own `.d.ts` in favor of the namespace-level exports (`export * from './dom'` in `preact/src/index.d.ts`).

### `src/ui` — component system

Full architecture, SCSS naming convention, and the BASIC/NORMAL/PREMIUM roadmap are documented in `docs/component-system-plan.md` — read that before adding or changing components. Summary of what's implemented (BASIC tier):

- **Folder-isolated by design**: app code (`src/app.tsx`) should only ever import from the barrel `src/ui/index.ts` (or `@ui`), never reach into `src/ui/{atoms,molecules,organisms}/*/*.tsx` directly — that's what keeps a future `mv src/ui packages/ui-preact` mechanical.
- **Atomic-design tiers**: `atoms/` (single-purpose, no sub-parts — `Box`, `Text`, `Badge`), `molecules/` (combine atoms/state into one control — `Stack`, `Button`), `organisms/` (NORMAL+ multi-part compound components; folder doesn't exist yet — created with the first one, per YAGNI).
- **Tokens**: `@ui/tokens/_primitive.scss` (raw values + the `fluid()` Sass function) → `_semantic.scss` (role-based CSS custom properties: `--color-*`, `--space-*`, `--radius-*`, `--font-size-*`), emitted once via `@ui/index.scss`. Light/dark handled by `prefers-color-scheme` plus an explicit `[data-theme]` override that always wins (see `ThemeProvider`). Typography (`--font-size-sm/md/lg`) is fluid — `clamp()`-based, mobile-first, no `@media` breakpoints; the `fluid($min-px, $max-px)` helper generates the `clamp()` expression.
- **Components** (`Box`, `Stack`, `Text`, `Button`, `Badge`): each is `Name.tsx` + `Name.module.scss` + `Name.types.ts` + `Name.test.tsx` + `index.ts`, following the BEM-ish class convention in the plan doc (`block`, `block__element`, `block--modifier`, `data-*` for runtime state, `--<block>-<token>` for component-scoped CSS vars).
- **`utils/variant.ts`**: hand-rolled, zero-dependency CVA-shaped helper that resolves BEM class names through a component's CSS-module `styles` export.
- **`utils/polymorphic.ts`**: `asPolymorphic()` types `Box`/`Stack`/`Text`'s dynamic `as` tag without `any` — narrows to `PolymorphicElementProps` (the prop shape every intrinsic element accepts) instead of erasing the type. A full generic `PolymorphicProps<E, P>` (sketched in the plan doc) is a NORMAL-tier upgrade once more components need per-element prop inference.
