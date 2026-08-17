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
- `playground.html` → `src/playground-main.tsx` mounts `<Playground />` (`src/ui/playground/Playground.tsx`) — a visual gallery of every `src/ui` component, used to eyeball changes without touching the real app. Both HTML entries are wired into `vite.config.ts`'s `build.rollupOptions.input`, so `npm run build` emits both.
- Path aliases in `tsconfig.app.json` map `react`/`react-dom` imports to `preact/compat`, so React-ecosystem libraries expecting those imports work under Preact.
- JSX uses Preact's automatic runtime (`jsxImportSource: "preact"`), so no manual `h` import needed.
- TypeScript project is split via references: `tsconfig.json` (root) → `tsconfig.app.json` (src, app code) + `tsconfig.node.json` (Vite config). Build with `tsc -b`, not plain `tsc`.
- Styling is SCSS throughout (`sass` devDependency). App-level tokens live in `src/styles/_tokens.scss`; the `src/ui` component system has its own, separate token layer (see below) — the two don't share CSS variable names on purpose, so the component system stays extractable.

### `src/ui` — component system

Full architecture, SCSS naming convention, and the BASIC/NORMAL/PREMIUM roadmap are documented in `docs/component-system-plan.md` — read that before adding or changing components. Summary of what's implemented (BASIC tier):

- **Folder-isolated by design**: app code (`src/app.tsx`) should only ever import from the barrel `src/ui/index.ts`, never reach into `src/ui/components/*/*.tsx` directly — that's what keeps a future `mv src/ui packages/ui-preact` mechanical.
- **Tokens**: `src/ui/tokens/_primitive.scss` (raw values) → `_semantic.scss` (role-based CSS custom properties: `--color-*`, `--space-*`, `--radius-*`, `--font-*`), emitted once via `src/ui/index.scss`. Light/dark handled by `prefers-color-scheme` plus an explicit `[data-theme]` override that always wins (see `ThemeProvider`).
- **Components** (`Box`, `Stack`, `Text`, `Button`, `Badge`): each is `Name.tsx` + `Name.module.scss` + `Name.types.ts` + `Name.test.tsx` + `index.ts`, following the BEM-ish class convention in the plan doc (`block`, `block__element`, `block--modifier`, `data-*` for runtime state, `--<block>-<token>` for component-scoped CSS vars).
- **`utils/variant.ts`**: hand-rolled, zero-dependency CVA-shaped helper that resolves BEM class names through a component's CSS-module `styles` export.
- Polymorphic `as` props are typed loosely (`as any` at the JSX-tag boundary) rather than with a full generic `PolymorphicProps<E, P>` — that generic rollout is a NORMAL-tier task per the plan.
