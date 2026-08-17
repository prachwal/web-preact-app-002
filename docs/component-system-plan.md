# Component System — Architecture & Implementation Plan

Goal: a component system that lives inside this app today but is **structurally
separable** — folder-isolated, with its own package boundary, ready to be
pulled into a standalone npm package (`@nimbus/ui` or similar) with a
mechanical extraction, not a rewrite.

Modeled on the current best-in-class headless design systems (Radix
Primitives, Ark UI, shadcn/ui) but **dedicated to Preact**: no React-only
assumptions, no dependency that requires `preact/compat` shims unless
unavoidable, small runtime footprint, zero mandatory dependencies at the
lower tiers.

Sources consulted:

- [Design Systems and Tokens 2025 — Radix, shadcn/ui, Chakra, Ark UI compared](https://www.youngju.dev/blog/culture/2026-04-15-design-system-tokens-2025-complete-guide-radix-shadcn-chakra-tamagui-ark-tokens-studio-figma-variables-deep-dive-guide-2025.en)
- [Headless UI alternatives: Radix vs React Aria vs Ark UI vs Base UI](https://blog.logrocket.com/headless-ui-alternatives-radix-primitives-react-aria-ark-ui/)
- [How to Build a Scalable Design System in a Monorepo](https://www.freecodecamp.org/news/how-to-build-a-scalable-design-system-in-a-monorepo/)
- [Preact API Reference](https://preactjs.com/guide/v10/api-reference/)
- [Preact Libraries & Add-ons](https://preactjs.com/about/libraries-addons/)

---

## 1. Architectural decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Logic/style split | **Headless hooks + styled SCSS modules**, not CSS-in-JS | Matches Radix/Ark's core insight (behavior and skin are separable) without a runtime style engine — SCSS compiles away, zero JS styling cost |
| Token layer | **Primitive → semantic → component** tokens, SCSS vars compiled to CSS custom properties | Same split used by Radix/Chakra/Ark. CSS vars make theming and per-instance override ("code-driven appearance") free at runtime |
| Variant API | Small hand-rolled `variant()` helper (CVA-shaped) at BASIC; adopt `class-variance-authority` only if the matrix outgrows it at NORMAL+ | `cva` itself has no Preact-specific code (works via plain `class` strings), but a 40-line local version keeps BASIC at zero deps |
| Ref/polymorphism | `preact/compat` `forwardRef` + `as`/`asChild` prop | Preact 10 (current dep, `^10.29.8`) still needs `compat` for `forwardRef`; v11 forwards by default but we're not on it |
| Complex state (Menu, Combobox, Dialog) | Hand-rolled reducer + a11y utils, **not** a state-machine library (Zag/XState) | Ark UI's state-machine approach is powerful but heavy for this scope; a reducer gets the same predictability at a fraction of the bytes |
| Package boundary | Isolated folder with its own `package.json`, `tsconfig`, barrel `index.ts` from day one | Lets extraction to a real npm package be "move folder + `npm publish`", not an untangling project |

---

## 2. Folder structure (lives inside this repo, extraction-ready)

```text
src/ui/                          # ← the whole system; app code never reaches
                                  #   past this boundary into component internals
  package.json                   # name, exports map, peerDependencies: preact
  tsconfig.json                  # extends root, own `outDir`/`rootDir`
  index.ts                       # public barrel — the only import surface for /src

  tokens/
    _primitive.scss              # raw scale: color ramps, spacing scale, radii, type scale
    _semantic.scss                # role-based: --color-bg, --color-fg, --color-accent...
    tokens.ts                    # TS mirror of the semantic token names (typed access)

  theme/
    ThemeProvider.tsx            # context + data-theme attribute + CSS var injection
    theme.types.ts               # ThemeTokens, ThemeOverride<T>

  utils/
    cx.ts                        # class-name join (tiny, no dep)
    variant.ts                   # BASIC-tier CVA-shaped helper
    mergeRefs.ts
    useControllableState.ts
    useId.ts

  primitives/                    # headless-only, no SCSS, reused by components/
    useDisclosure.ts
    useFocusTrap.ts
    useListNavigation.ts

  components/
    Button/
      Button.tsx
      Button.module.scss
      Button.types.ts
      Button.test.tsx
      index.ts
    Field/ …
    Tabs/ …

  playground/                    # dev-only visual gallery, not shipped in the package
    Playground.tsx
```

App code (`src/app.tsx` etc.) imports **only** from `src/ui` (the barrel),
never from `src/ui/components/Button/Button.tsx` directly — that boundary is
what makes the later `mv src/ui packages/ui-preact` mechanical.

---

## 3. Core data structures & types

```ts
// tokens/tokens.ts — typed handle onto the semantic CSS custom properties
export type ColorToken =
  | 'bg' | 'bg-subtle' | 'surface'
  | 'fg' | 'fg-muted'
  | 'border'
  | 'accent' | 'accent-fg'
  | 'danger' | 'success' | 'warning'

export type SpaceToken = 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16 | 24 | 32
export type RadiusToken = 'sm' | 'md' | 'lg' | 'full'

export interface ThemeTokens {
  color: Record<ColorToken, string>
  space: Record<SpaceToken, string>
  radius: Record<RadiusToken, string>
  font: { sans: string; mono: string }
}

// deep-partial override, e.g. for a per-brand or per-route theme
export type ThemeOverride<T> = { [K in keyof T]?: T[K] extends object ? ThemeOverride<T[K]> : T[K] }
```

```ts
// utils/variant.ts — BASIC-tier variant() (CVA-shaped, zero-dep)
type VariantMap = Record<string, Record<string, string>>

interface VariantConfig<V extends VariantMap> {
  base?: string
  variants: V
  defaultVariants?: { [K in keyof V]?: keyof V[K] }
}

type VariantProps<V extends VariantMap> = { [K in keyof V]?: keyof V[K] }

export function variant<V extends VariantMap>(config: VariantConfig<V>) {
  return (props: VariantProps<V> = {}) => {
    const classes = [config.base]
    for (const key in config.variants) {
      const chosen = props[key] ?? config.defaultVariants?.[key]
      if (chosen != null) classes.push(config.variants[key][chosen as string])
    }
    return classes.filter(Boolean).join(' ')
  }
}
```

```ts
// components/Button/Button.types.ts — polymorphic + style-override contract
import type { ComponentChildren, JSX } from 'preact'

export type Tone = 'neutral' | 'accent' | 'danger'
export type Size = 'sm' | 'md' | 'lg'

export interface ButtonOwnProps {
  tone?: Tone
  size?: Size
  loading?: boolean
  /** escape hatch for code-driven appearance, merged after variant classes */
  className?: string
  /** escape hatch for one-off CSS var overrides, e.g. { '--button-bg': '#111' } */
  style?: JSX.CSSProperties
  children?: ComponentChildren
}

// polymorphic `as` — same shape used by Radix's asChild / Chakra's `as`
export type PolymorphicProps<E extends keyof JSX.IntrinsicElements, P> =
  P & { as?: E } & Omit<JSX.IntrinsicElements[E], keyof P | 'as'>
```

```ts
// theme/theme.types.ts — provider contract
export interface ThemeProviderProps {
  theme?: 'light' | 'dark' | 'system'
  override?: ThemeOverride<ThemeTokens>
  children?: ComponentChildren
}
```

---

## 4. SCSS class naming convention

BEM-shaped, same spirit as the app-level SCSS already in `src/app.scss`
(`.hero__title`, `.btn--primary`), applied consistently across every
component so the rule never needs re-deriving per file.

| Concept | Rule | Example |
| --- | --- | --- |
| **Block** | Kebab-case of the component name, matches the folder name exactly (no abbreviations) | `Button` → `.button`, `ButtonGroup` → `.button-group` |
| **Element** | `block__element` | `.button__icon`, `.field__label` |
| **Modifier** (static, prop-driven) | `block--property-value` | `.button--tone-accent`, `.button--size-lg` |
| **State** (runtime, JS-driven) | `data-*` attribute on the block root, **never** a class | `[data-loading]`, `[data-state="open"]`, `[data-invalid]` |
| **Compound component** | One block name shared by every part, one SCSS module for the whole family | `Tabs` → `.tabs`, `.tabs__list`, `.tabs__trigger`, `.tabs__panel` (single `Tabs.module.scss`) |
| **Component token (CSS var)** | `--<block>-<property>`, block matches the class block exactly | `--button-bg`, `--field-border`, `--tabs-indicator-color` |
| **File** | `ComponentName.module.scss`, PascalCase file next to its component | `components/Button/Button.module.scss` |

Rationale for classes vs. `data-*`: modifiers describe a prop the caller set
(`tone="accent"`) and are stable for the component's lifetime; states
describe something that changes while mounted (open/closed, loading,
highlighted) — keeping those as attributes avoids a combinatorial class
explosion and matches the convention Radix/Ark already use, which also makes
state directly stylable and testable (`[data-state="open"]`) without
duplicating it into a class.

Styling contract per component (how "SCSS or code" both work):

1. **SCSS module** consumes semantic CSS vars (`background: var(--color-accent)`)
   and re-exposes them as component-scoped vars (`--button-bg: var(--color-accent)`)
   so a single instance can be retargeted.
2. **Code override** = pass `style={{ '--button-bg': '#fff' }}` or `className`
   — both flow through the component's `*OwnProps` (see `ButtonOwnProps`
   above). No component reaches into another component's internals to
   restyle it; the component-level CSS var is the only public style seam.

---

## 5. BASIC — foundation

Ships a usable, tested, on-brand primitive set. No overlays, no compound
components.

### BASIC infrastructure

- [ ] `src/ui` package skeleton: own `package.json` (name, `"type": "module"`,
      `exports` map, `peerDependencies: { preact: "^10" }`, `sideEffects: false`), own `tsconfig.json`
- [ ] Token layer: `_primitive.scss` + `_semantic.scss`, compiled to `:root` CSS vars, light/dark via `prefers-color-scheme` (reuse pattern already in `src/styles/_reset.scss`)
- [ ] `ThemeProvider` (context + `data-theme` attribute override, no override-object support yet)
- [ ] `utils/cx`, `utils/variant` (hand-rolled, shown above)
- [ ] Barrel `src/ui/index.ts` — app imports only from here

### BASIC components

- [ ] **`Box`** — polymorphic layout escape hatch
  - [ ] Parts: `.box` (root only)
  - [ ] Variants: none — pure passthrough, no SCSS modifiers
  - [ ] Props: `as`, `className`, `style`, `children`
  - [ ] A11y: renders exactly as the `as` element, no implicit role
  - [ ] Tests: renders custom `as` tag, forwards `className`/`style`
- [ ] **`Stack`** — flex layout primitive
  - [ ] Parts: `.stack`
  - [ ] Variants: `.stack--direction-{row|column}`, `.stack--align-{start|center|end|stretch}`, `.stack--justify-{start|center|end|between}`
  - [ ] Tokens: `--stack-gap`
  - [ ] Props: `direction`, `align`, `justify`, `gap` (`SpaceToken`), `as`
  - [ ] Tests: `gap` token applied, `direction` modifier applied
- [ ] **`Text`** — typography primitive
  - [ ] Parts: `.text`
  - [ ] Variants: `.text--size-{sm|md|lg}`, `.text--weight-{regular|medium|bold}`, `.text--tone-{fg|fg-muted|danger}`
  - [ ] Tokens: `--text-color`
  - [ ] Props: `size`, `weight`, `tone`, `as` (default `span`)
  - [ ] Tests: each size/tone variant applies the expected class
- [ ] **`Button`**
  - [ ] Parts: `.button`, `.button__icon`, `.button__label`, `.button__spinner`
  - [ ] Variants: `.button--tone-{neutral|accent|danger}`, `.button--size-{sm|md|lg}`
  - [ ] States: `[data-loading]`, `[disabled]`
  - [ ] Tokens: `--button-bg`, `--button-fg`, `--button-border`, `--button-radius`
  - [ ] Props: `tone`, `size`, `loading`, `disabled`, `as`, `className`, `style`
  - [ ] A11y: native `<button>` by default, `aria-busy` when `loading`, visible `:focus-visible` ring
  - [ ] Tests: tone/size variants render the right class, `disabled` blocks `onClick`, `loading` sets `aria-busy`
- [ ] **`Badge`**
  - [ ] Parts: `.badge`, `.badge__dot`
  - [ ] Variants: `.badge--tone-{neutral|accent|success|warning|danger}`
  - [ ] Tokens: `--badge-bg`, `--badge-fg`
  - [ ] Props: `tone`, `children`
  - [ ] A11y: renders as `<span>`, decorative dot carries `aria-hidden`
  - [ ] Tests: tone variant applies class, dot hidden from the a11y tree

**Exit criteria:** `src/app.tsx` can build its hero page using only `src/ui`
components, with zero one-off CSS in `app.scss` for buttons/badges/layout.

---

## 6. NORMAL — real product surface

### NORMAL infrastructure

- [ ] Component-scoped CSS vars for every component so per-instance code overrides work everywhere, not just `Button`
- [ ] `forwardRef` (via `preact/compat`) + `PolymorphicProps<E, P>` rolled out to all components
- [ ] `useControllableState`, `useId` — controlled/uncontrolled pattern for form primitives
- [ ] Variant matrix growing → decide then whether to swap hand-rolled `variant()` for `class-variance-authority`
- [ ] `src/ui/playground` route: local dev-only gallery of every component × variant (skip full Storybook — Vite dev server + one route covers this at current scale)
- [ ] Extraction dress rehearsal: separate Vite lib-mode build (`vite build --config vite.ui.config.ts`, ESM + `.d.ts`), verify with `npm pack --dry-run`

### NORMAL components

- [ ] **`Input`**
  - [ ] Parts: `.input`
  - [ ] States: `[data-invalid]`, `[disabled]`
  - [ ] Tokens: `--input-border`, `--input-bg`, `--input-fg`
  - [ ] Props: `value`/`defaultValue` (via `useControllableState`), `onValueChange`, `invalid`, `disabled`, `size`
  - [ ] A11y: native `<input>`; label association (`aria-describedby`/`aria-invalid`) supplied by `Field`
  - [ ] Tests: controlled + uncontrolled modes, `invalid` sets `aria-invalid`
- [ ] **`Textarea`**
  - [ ] Parts: `.textarea`
  - [ ] States: `[data-invalid]`, `[disabled]`
  - [ ] Tokens: `--textarea-border`, `--textarea-bg`
  - [ ] Props: same controllable pattern as `Input`, plus `rows`
  - [ ] Tests: same as `Input`, plus `rows` passthrough
- [ ] **`Checkbox`**
  - [ ] Parts: `.checkbox`, `.checkbox__control`, `.checkbox__icon`
  - [ ] States: `data-state="checked|unchecked|indeterminate"`, `[disabled]`
  - [ ] Tokens: `--checkbox-bg`, `--checkbox-border`, `--checkbox-check`
  - [ ] Props: `checked`/`defaultChecked`, `onCheckedChange`, `indeterminate`, `disabled`
  - [ ] A11y: backed by a real `<input type="checkbox">`, never a `div` faking it; indeterminate set imperatively via ref
  - [ ] Tests: controlled/uncontrolled, indeterminate sets `aria-checked="mixed"`
- [ ] **`Switch`**
  - [ ] Parts: `.switch`, `.switch__thumb`
  - [ ] States: `data-state="checked|unchecked"`, `[disabled]`
  - [ ] Tokens: `--switch-bg`, `--switch-thumb-bg`
  - [ ] Props: `checked`/`defaultChecked`, `onCheckedChange`, `disabled`
  - [ ] A11y: `role="switch"` + `aria-checked`, toggles on `Space`
  - [ ] Tests: keyboard toggle, controlled/uncontrolled
- [ ] **`Select`**
  - [ ] Parts: `.select`
  - [ ] States: `[data-invalid]`, `[disabled]`
  - [ ] Tokens: `--select-border`, `--select-bg`
  - [ ] Props: native `<select>` passthrough + controllable pattern, `options` convenience prop
  - [ ] A11y: native `<select>` — defers listbox a11y to the browser, no custom popup at this tier
  - [ ] Tests: option list renders, change fires `onValueChange`
- [ ] **`Field`** — label/hint/error wrapper for any control
  - [ ] Parts: `.field`, `.field__label`, `.field__hint`, `.field__error`
  - [ ] States: `[data-invalid]` (propagates `aria-invalid`/`aria-describedby` to the wrapped control via context)
  - [ ] Tokens: `--field-label-color`, `--field-error-color`
  - [ ] Props: `label`, `hint`, `error`, `required`, `children` (the control)
  - [ ] A11y: wires `<label for>` and `aria-describedby` automatically
  - [ ] Tests: error text linked via `aria-describedby`, label linked via `htmlFor`
- [ ] **`Grid`**
  - [ ] Parts: `.grid`
  - [ ] Variants: `.grid--columns-{1..12}`
  - [ ] Tokens: `--grid-gap`
  - [ ] Props: `columns`, `gap`, `as`
  - [ ] Tests: `columns` modifier applied
- [ ] **`Container`**
  - [ ] Parts: `.container`
  - [ ] Variants: `.container--width-{sm|md|lg|full}`
  - [ ] Tokens: `--container-max-width`
  - [ ] Props: `width`, `as`
  - [ ] Tests: `width` modifier applied
- [ ] **`Divider`**
  - [ ] Parts: `.divider`
  - [ ] Variants: `.divider--orientation-{horizontal|vertical}`
  - [ ] Tokens: `--divider-color`
  - [ ] Props: `orientation`
  - [ ] A11y: `role="separator"`
  - [ ] Tests: orientation modifier applied, role present
- [ ] **`Tooltip`**
  - [ ] Parts: `.tooltip`, `.tooltip__trigger`, `.tooltip__content`, `.tooltip__arrow`
  - [ ] States: `data-state="open|closed"`
  - [ ] Tokens: `--tooltip-bg`, `--tooltip-fg`
  - [ ] Props: `content`, `delay`, `placement`
  - [ ] A11y: `role="tooltip"`, `aria-describedby` wired from trigger to content, dismisses on `Escape`
  - [ ] Tests: opens on hover/focus after `delay`, closes on `Escape`, `aria-describedby` present
- [ ] **`Popover`**
  - [ ] Parts: `.popover`, `.popover__trigger`, `.popover__content`
  - [ ] States: `data-state="open|closed"` (built on shared `useDisclosure`)
  - [ ] Tokens: `--popover-bg`, `--popover-border`, `--popover-shadow`
  - [ ] Props: `open`/`defaultOpen`, `onOpenChange`
  - [ ] A11y: focus moves into content on open (`useFocusTrap`), returns to trigger on close, closes on outside click / `Escape`
  - [ ] Tests: focus trap engages, outside click closes, controlled/uncontrolled open state

---

## 7. PREMIUM — extractable product

### PREMIUM infrastructure

- [ ] Motion tokens: CSS transition/keyframe durations & easings as tokens, respect `prefers-reduced-motion`; optional Web Animations API helper — no animation dependency
- [ ] Multi-brand theming: `ThemeOverride<ThemeTokens>` fully wired into `ThemeProvider`, runtime `data-theme` + CSS var swap, per-route/per-tenant theme
- [ ] i18n-ready primitives: zero hardcoded copy anywhere — all strings via props/slots
- [ ] Automated a11y checks in the test suite (`vitest-axe` or equivalent) on every component
- [ ] Visual regression: lightweight Playwright screenshot diff for the core set
- [ ] Real publish pipeline: Changesets for semver + changelog, `exports` map with `types`/`import`/`browser` conditions, typedoc-generated API reference
- [ ] Actual extraction: `src/ui` → `packages/ui-preact` (or standalone repo), consumed back by the app via workspace protocol, published to npm

### PREMIUM components

All PREMIUM components are compound (`Component.Root/…`) and share one
block/one SCSS module per family, per the naming convention above.

- [ ] **`Tabs`**
  - [ ] Parts: `.tabs`, `.tabs__list`, `.tabs__trigger`, `.tabs__panel`, `.tabs__indicator`
  - [ ] States: `data-state="active|inactive"` on triggers/panels
  - [ ] Tokens: `--tabs-indicator-color`
  - [ ] API: `Tabs.Root value/defaultValue/onValueChange`, `Tabs.List`, `Tabs.Trigger value`, `Tabs.Panel value`
  - [ ] A11y: `role="tablist"`/`"tab"`/`"tabpanel"`, roving `tabindex`, arrow-key navigation (`useListNavigation`)
  - [ ] Tests: arrow-key nav moves selection, panel visibility follows `value`
- [ ] **`Dialog`**
  - [ ] Parts: `.dialog`, `.dialog__overlay`, `.dialog__content`, `.dialog__title`, `.dialog__close`
  - [ ] States: `data-state="open|closed"`
  - [ ] Tokens: `--dialog-overlay-bg`, `--dialog-bg`, `--dialog-shadow`
  - [ ] API: `Dialog.Root open/defaultOpen/onOpenChange`, `Dialog.Trigger`, `Dialog.Content`
  - [ ] A11y: `role="dialog"` + `aria-modal`, focus trapped and restored on close, `Escape` + overlay click close, initial focus on first focusable/close button
  - [ ] Tests: focus trap + restore, `Escape` closes, `aria-modal` present
- [ ] **`Menu`**
  - [ ] Parts: `.menu`, `.menu__trigger`, `.menu__content`, `.menu__item`, `.menu__separator`
  - [ ] States: `data-state="open|closed"` on content, `data-highlighted` on the active item
  - [ ] Tokens: `--menu-bg`, `--menu-item-highlight-bg`
  - [ ] API: `Menu.Root open/onOpenChange`, `Menu.Item onSelect/disabled`
  - [ ] A11y: `role="menu"`/`"menuitem"`, full arrow-key + typeahead navigation (`useListNavigation`), closes on select
  - [ ] Tests: typeahead jumps to matching item, `Escape`/outside click closes, disabled item unselectable
- [ ] **`Combobox`**
  - [ ] Parts: `.combobox`, `.combobox__input`, `.combobox__list`, `.combobox__option`
  - [ ] States: `data-state="open|closed"` on the list, `data-selected`/`data-highlighted` on options
  - [ ] Tokens: `--combobox-list-bg`, `--combobox-option-highlight-bg`
  - [ ] API: `value`/`onValueChange`, `inputValue`/`onInputChange`, `options`/`filter`
  - [ ] A11y: `role="combobox"` + `aria-expanded`/`aria-activedescendant`, `role="listbox"`/`"option"`, arrow-key nav
  - [ ] Tests: filtering narrows options, arrow keys move `aria-activedescendant`, Enter selects
- [ ] **`Toast`**
  - [ ] Parts: `.toast`, `.toast__title`, `.toast__description`, `.toast__close`, `.toast-viewport` (portal-mounted region — separate block, since it isn't nested under a single toast)
  - [ ] States: `data-state="open|closed"` (drives enter/exit transition), `data-type="info|success|warning|danger"`
  - [ ] Tokens: `--toast-bg`, `--toast-border`
  - [ ] API: imperative queue (`toast.show({ title, description, type, duration })`) + `ToastViewport` component to mount
  - [ ] A11y: `role="status"`/`role="alert"` depending on `type`, `aria-live` region, auto-dismiss timing respects `prefers-reduced-motion`
  - [ ] Tests: queue add/dismiss, auto-dismiss timer, `aria-live` politeness matches `type`

---

## 8. What's deliberately out of scope

- No CSS-in-JS runtime (styled-components-style) — SCSS modules + CSS vars cover both "SCSS-driven" and "code-driven" appearance without paying a runtime styling cost.
- No state-machine library (XState/Zag) — hand-rolled reducers are enough at this component count; revisit only if PREMIUM's primitive count and interaction complexity outgrow it.
- No Storybook until NORMAL's playground route stops being enough.
