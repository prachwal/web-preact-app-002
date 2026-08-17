# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server (HMR)
- `npm run build` — typecheck via `tsc -b` then production build via `vite build` (builds both `index.html` and `playground.html`, see below)
- `npm run preview` — serve the production build locally
- `npm test` — run tests once (Vitest)
- `npm run test:watch` — Vitest in watch mode
- `npx vitest run src/app.test.tsx` — run a single test file
- `npm run test:visual` — Playwright visual regression against `playground.html` (needs `npm run build` first — it serves the real build via `vite preview`, not the dev server)
- `npm run test:visual:update` — regenerate the committed baseline screenshots after an intentional visual change
- `npm run changeset` — record a changeset (semver + changelog entry) for a `src/ui` change

No linter configured yet. No `npm install` needed if `node_modules` already present.

## Testing

Vitest + `@testing-library/preact` + jsdom, configured inline in `vite.config.ts` (`test` field, which also excludes `e2e/**` — those are Playwright specs, not Vitest). Setup file `src/test/setup.ts` registers `@testing-library/jest-dom` matchers, `vitest-axe`'s matcher (its own `extend-expect` entry ships empty in the installed version — registered by hand via `expect.extend`), and RTL's `cleanup` after each test. Test files live next to source as `*.test.tsx`.

Visual regression (Playwright, `e2e/visual.spec.ts`) is separate from Vitest — see `test:visual` above. Baselines are committed under `e2e/visual.spec.ts-snapshots/`.

## Architecture

Preact + TypeScript + Vite app with two parts: the hero page (`src/app.tsx`) and a folder-isolated component system under `src/ui/`.

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

Import `HTMLAttributes`, `ButtonHTMLAttributes`, `InputHTMLAttributes`, `CSSProperties`, etc. directly from `'preact'` — not `JSX.HTMLAttributes`/`JSX.CSSProperties`. The `JSX.*` aliases are `@deprecated` in Preact's own `.d.ts` in favor of the namespace-level exports (`export * from './dom'` in `preact/src/index.d.ts`). Attribute-specific properties (`disabled`, `placeholder`, …) live on the per-element interface (`ButtonHTMLAttributes`, `InputHTMLAttributes`), not the generic `HTMLAttributes` — using the wrong one is a common source of "property X does not exist" errors here.

### `src/ui` — component system

Full architecture, SCSS naming convention, and the BASIC/NORMAL/PREMIUM roadmap are documented in `docs/component-system-plan.md` — read that before adding or changing components. All three tiers are implemented; summary:

- **Folder-isolated by design**: app code (`src/app.tsx`) should only ever import from the barrel `src/ui/index.ts` (or `@ui`), never reach into `src/ui/{atoms,molecules,organisms}/*/*.tsx` directly — that's what keeps a future `mv src/ui packages/ui-preact` mechanical. That extraction itself hasn't happened (see the plan doc §8) — `src/ui` is still consumed as source from inside this app.
- **Atomic-design tiers**: `atoms/` (single-purpose, no sub-parts — `Box`, `Text`, `Badge`, `Input`, `Textarea`, `Checkbox`, `Switch`, `Select`, `Grid`, `Container`, `Divider`), `molecules/` (combine atoms/state into one control — `Stack`, `Button`, `Tooltip`, `Popover`), `organisms/` (multi-part compound components — `Field`, `Tabs`, `Dialog`, `Menu`, `Combobox`, `Toast`).
- **Compound organisms** (`Tabs`, `Dialog`, `Menu`) export a `{ Root, Trigger, Content, ... }` object, not a single component — `import { Tabs } from '@ui'` then `<Tabs.Root>`. `Combobox` and `Toast` don't follow that shape (see the plan doc §8 for why); `Field` wraps a single child control via `cloneElement`.
- **`Dialog.Trigger`/`Menu.Trigger`'s `asChild` prop**: pass it when the trigger's child is already interactive (e.g. `<Button>`) so the prop clones onto the child instead of wrapping it in a second `<button>` — omitting it with an interactive child produces a real a11y bug (nested interactive elements), caught by the `vitest-axe` smoke test below.
- **Tokens**: `@ui/tokens/_primitive.scss` (raw values + the `fluid()` Sass function) → `_semantic.scss` (role-based CSS custom properties: `--color-*`, `--space-*`, `--radius-*`, `--font-size-*`, `--duration-*`, `--ease-*`), emitted once via `@ui/index.scss`. Light/dark handled by `prefers-color-scheme` plus an explicit `[data-theme]` override that always wins (see `ThemeProvider`). Typography is fluid — `clamp()`-based, mobile-first, no `@media` breakpoints. Motion durations zero out under `prefers-reduced-motion: reduce`.
- **`ThemeProvider`'s `override` prop**: flattens a `ThemeOverride<ThemeTokens>` onto `document.documentElement` as inline CSS custom properties (same global-swap mechanism as `data-theme`) for per-brand/per-tenant theming.
- **Components**: each is `Name.tsx` + `Name.module.scss` + `Name.types.ts` + `Name.test.tsx` + `index.ts`, following the BEM-ish class convention in the plan doc (`block`, `block__element`, `block--modifier`, `data-*` for runtime state, `--<block>-<token>` for component-scoped CSS vars). `[data-invalid]`/`[data-*]` presence-based selectors must never be set to `false` (still renders `data-x="false"`, still matches `[data-x]`) — use `condition ? true : undefined`. This exact bug shipped once in `Field` and was caught visually, not by a unit test — see the regression test in `Field.test.tsx`.
- **`utils/variant.ts`**: hand-rolled, zero-dependency CVA-shaped helper; deliberately not swapped for `class-variance-authority`.
- **`utils/polymorphic.ts`**: `polymorphicForwardRef()` + `PolymorphicProps<E, P>` type `Box`/`Stack`/`Text`/`Grid`/`Container`'s dynamic `as` tag without `any`.
- **`utils/useControllableState.ts`**: controlled/uncontrolled pattern; also returns `isControlled`, which every native form control uses to synchronously revert the browser's own DOM-property mutation inside the event handler when controlled — see "Controlled form elements" in the plan doc §5.
- **`utils/useDisclosure.ts` / `utils/useFocusTrap.ts`**: open-state + Tab-trap/focus-restore, shared by `Popover`, `Dialog`.
- **`utils/motion.ts`**: `prefersReducedMotion()` + `animateIfAllowed()` (WAAPI, no dependency) — guards jsdom's lack of `matchMedia`/`Element.animate`, so it's safe to call in tests too.
- **`Toast`**: `Toast.store.ts` is a module-level pub/sub store, not React state or context — `toast.show(...)` must be callable from anywhere (an event handler, a `.catch()`, outside any component). Tests must call `toast.clear()` in `afterEach` — the store persists across tests within one test file otherwise.
- **Tests**: a few RTL helpers are unreliable in this project's jsdom version — `fireEvent.change` on a `<select>`, and `fireEvent.focusIn`/`mouseEnter` bubbling. The affected tests (`Select`, `Tooltip`) dispatch the native event manually instead (`ponytail:` comments explain why) — don't "fix" those back to the `fireEvent.X` shorthand without re-verifying first. `Playground.a11y.test.tsx` runs `vitest-axe` once against the whole gallery's default state rather than per-component.
