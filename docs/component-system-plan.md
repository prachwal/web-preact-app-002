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
| Ref/polymorphism | `preact/compat` `forwardRef` + `as` prop, typed via `asPolymorphic()` (no `any`) | Preact 10 (current dep, `^10.29.8`) still needs `compat` for `forwardRef`; v11 forwards by default but we're not on it |
| Complex state (Menu, Combobox, Dialog) | Hand-rolled reducer + a11y utils, **not** a state-machine library (Zag/XState) | Ark UI's state-machine approach is powerful but heavy for this scope; a reducer gets the same predictability at a fraction of the bytes |
| Package boundary | Isolated folder with its own `package.json`, barrel `index.ts`, path aliases from day one | Lets extraction to a real npm package be "move folder + `npm publish`", not an untangling project |
| Component hierarchy | Atomic-design tiers (`atoms/` → `molecules/` → `organisms/`) instead of a flat `components/` | Makes composability explicit — an organism is only ever built from molecules/atoms, never the reverse, so the dependency direction can't tangle as the library grows |
| Typography scale | `clamp()`-based fluid tokens, mobile-first, no breakpoints | The min bound of `clamp()` *is* the mobile value — continuous scaling up removes the need for `@media (min-width: …)` step changes for type |

---

## 2. Folder structure (lives inside this repo, extraction-ready)

```text
src/ui/                          # ← the whole system; app code never reaches
                                  #   past this boundary into component internals
  package.json                   # name, exports map, peerDependencies: preact
  index.ts                       # public barrel — the only import surface for /src
  index.scss                     # global entry: emits the :root token layer once

  tokens/
    _primitive.scss              # raw scale + the fluid() clamp() helper — no meaning attached
    _semantic.scss                # role-based: --color-bg, --color-fg, --color-accent, --font-size-*...
    tokens.ts                    # TS mirror of the semantic token names (typed access)

  theme/
    ThemeProvider.tsx            # context + data-theme attribute + CSS var injection
    theme.types.ts               # ThemeTokens, ThemeOverride<T>

  utils/
    cx.ts                        # class-name join (tiny, no dep)
    variant.ts                   # CVA-shaped helper, still hand-rolled (see §5)
    polymorphic.ts                # PolymorphicProps<E,P> + polymorphicForwardRef() — no `any`
    mergeRefs.ts                 # combines a forwarded ref with an internal one
    useControllableState.ts      # controlled/uncontrolled pattern, returns isControlled too
    useDisclosure.ts             # open/show/hide/toggle — shared by Popover, later Dialog/Menu
    useFocusTrap.ts              # Tab-trap + focus-restore — shared by Popover, later Dialog/Menu
                                  # (no useId.ts — Preact ships one natively in preact/hooks)

  atoms/                         # smallest, single-purpose, no internal sub-parts
    Box/
    Text/
    Badge/
    Input/
    Textarea/
    Checkbox/
    Switch/
    Select/
    Grid/
    Container/
    Divider/

  molecules/                     # combine atoms/state into one reusable control
    Stack/
    Button/
    Tooltip/
    Popover/

  organisms/                     # multi-part compound components
    Field/                       # label/hint/error wrapper — the first one, added at NORMAL
                                  # (Tabs, Dialog, Menu, … land here at PREMIUM)

  playground/                    # dev-only visual gallery, not shipped in the package
    Playground.tsx
```

Each component folder follows the same shape regardless of tier:
`Name.tsx` + `Name.module.scss` + `Name.types.ts` + `Name.test.tsx` + `index.ts`.

App code (`src/app.tsx` etc.) imports **only** from `src/ui` (the barrel),
never from `src/ui/atoms/Box/Box.tsx` directly — that boundary is what makes
the later `mv src/ui packages/ui-preact` mechanical.

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
// Takes the component's CSS-module `styles` export as a second argument so
// it can resolve BEM class names to their (possibly hashed) module output.
type VariantMap = Record<string, Record<string, string>>
type StylesMap = Record<string, string>

interface VariantConfig<V extends VariantMap> {
  base?: string
  variants: V
  defaultVariants?: { [K in keyof V]?: keyof V[K] }
}

export function variant<V extends VariantMap>(config: VariantConfig<V>) {
  return (styles: StylesMap, props: { [K in keyof V]?: keyof V[K] } = {}): string => {
    const resolve = (name: string) => styles[name] ?? name
    const classes = config.base ? [resolve(config.base)] : []
    for (const key in config.variants) {
      const chosen = props[key] ?? config.defaultVariants?.[key]
      if (chosen != null) classes.push(resolve(config.variants[key][chosen as string]))
    }
    return classes.filter(Boolean).join(' ')
  }
}
```

```ts
// utils/polymorphic.ts — types a dynamic `as` tag without `any`
import { forwardRef } from 'preact/compat'
import type { FunctionComponent, HTMLAttributes, JSX, Ref } from 'preact'

export type ElementTag = keyof JSX.IntrinsicElements

// The common prop shape every intrinsic element accepts. TS can't resolve
// the full IntrinsicElements union for a runtime string, so this narrows
// the render call instead of erasing its type with `any`. Parametrized on
// `Element` (not `HTMLElement`) so it matches polymorphicForwardRef's
// `Ref<Element>` exactly — mixing the two intersects into an unsatisfiable
// ref type.
export type PolymorphicElementProps = HTMLAttributes<Element>

export function asPolymorphic(tag: ElementTag): FunctionComponent<PolymorphicElementProps> {
  return tag as unknown as FunctionComponent<PolymorphicElementProps>
}

// Full per-element polymorphic props: own props, `as`, and every attribute
// the chosen intrinsic element accepts. `ref` is the shared `Element` type,
// not a per-tag one — see the ponytail note in the source for why.
export type PolymorphicProps<E extends ElementTag, P = object> = P & { as?: E } & Omit<
    JSX.IntrinsicElements[E],
    keyof P | 'as' | 'ref'
  >

// Wraps a generic render function in forwardRef, then casts the result to a
// generic call signature — forwardRef's own type fixes one concrete P, so
// it can't express "props depend on the `as` the caller passes." One
// explicit, documented cast; every polymorphic component uses it.
export function polymorphicForwardRef<P>(
  render: (props: P & { as?: ElementTag }, ref: Ref<Element>) => JSX.Element,
) {
  return forwardRef<Element, P & { as?: ElementTag }>(render) as unknown as <E extends ElementTag = 'div'>(
    props: PolymorphicProps<E, P> & { ref?: Ref<Element> },
  ) => JSX.Element
}
```

```ts
// molecules/Button/Button.types.ts — style-override contract
// Note: HTMLAttributes/ButtonHTMLAttributes/CSSProperties are imported
// directly from 'preact', not via `JSX.HTMLAttributes` — the JSX.* aliases
// are @deprecated in favor of the namespace-level exports.
import type { ButtonHTMLAttributes, ComponentChildren, CSSProperties } from 'preact'

export type ButtonTone = 'neutral' | 'accent' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonOwnProps {
  tone?: ButtonTone
  size?: ButtonSize
  loading?: boolean
  /** escape hatch for code-driven appearance, merged after variant classes */
  className?: string
  /** escape hatch for one-off CSS var overrides, e.g. { '--button-bg': '#111' } */
  style?: CSSProperties
  children?: ComponentChildren
}

export type ButtonProps = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps>
```

`Box`/`Stack`/`Text`/`Grid`/`Container` all render through
`polymorphicForwardRef` + `PolymorphicProps<E, P>` above (the classic Radix
`asChild` / Chakra `as` shape) — rolled out at NORMAL, replacing BASIC's
lighter `asPolymorphic()`-only version.

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
| **File** | `ComponentName.module.scss`, PascalCase file next to its component | `atoms/Box/Box.module.scss` |

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

## 5. Coding conventions

### Import boundaries — path aliases

`@ui/*` → `src/ui/*` and `@/*` → `src/*`, configured in both
`tsconfig.app.json`'s `paths` and `vite.config.ts`'s `resolve.alias` (kept
in sync by hand — two small config blocks don't earn a
`vite-tsconfig-paths` dependency). Only same-directory imports
(`./Box.module.scss`, `./Box.types`) stay relative; anything crossing a
folder boundary goes through the alias — `@ui/utils/cx`, never
`../../utils/cx`.

### Atomic hierarchy

- **Atoms** (`src/ui/atoms/`) — smallest, single-purpose, no internal
  sub-parts: `Box`, `Text`, `Badge`.
- **Molecules** (`src/ui/molecules/`) — combine atoms/state into one
  reusable control with internal parts and/or props-driven composition:
  `Stack`, `Button`.
- **Organisms** (`src/ui/organisms/`) — reserved for NORMAL/PREMIUM's
  multi-part compound components (`Field`, `Tabs`, `Dialog`, `Menu`, …); the
  folder doesn't exist until the first one does, per YAGNI.
- The barrel `src/ui/index.ts` re-exports across all three tiers — the
  split is an internal organizing principle, not part of the public API.

### No `any`

- `as`-driven polymorphism (`Box`, `Stack`, `Text`) is typed through
  `utils/polymorphic.ts`'s `asPolymorphic()` / `PolymorphicElementProps`
  instead of a raw `as any` cast on the dynamic tag — narrowed to "whatever
  every intrinsic element accepts," not erased.
- Preact's attribute types (`HTMLAttributes`, `ButtonHTMLAttributes`,
  `CSSProperties`, …) are imported directly from `'preact'`, not via
  `JSX.HTMLAttributes` — the `JSX.*` aliases carry an `@deprecated` tag in
  Preact's own `.d.ts` in favor of the namespace-level exports.

### Fluid typography (mobile-first, no breakpoints)

- `tokens/_primitive.scss` exports a `fluid($min-px, $max-px, $min-vw,
  $max-vw)` Sass function returning a `clamp()` expression; the semantic
  layer's `--font-size-sm/md/lg` tokens are built from it.
- This replaces step-based `@media (min-width: …)` type scaling — the
  browser interpolates continuously between the mobile (`$min-vw`) and
  desktop (`$max-vw`) bounds, so "mobile-first" falls out automatically: the
  `$min` value *is* the mobile size, already applied with zero media
  queries.
- Components read `var(--font-size-*)`, never a hardcoded `rem` size, so
  re-tuning the scale later is a one-line change in `_semantic.scss`.
- Layout gutters (e.g. `Playground.module.scss`'s page padding) use the same
  `clamp()` technique inline where a reusable token isn't warranted yet.

### Controlled form elements

Native form elements (`<input>`, `<textarea>`, `<select>`, a checkbox) mutate
their own DOM property (`.value`/`.checked`) on user interaction regardless
of props — and Preact skips reapplying a prop whose vnode value hasn't
changed since the last render. A **controlled** instance (`value`/`checked`
prop present, caller doesn't update it in `onChange`) therefore doesn't
re-render at all, so there's no later moment to correct the native mutation.

Fix, used consistently in `Input`/`Textarea`/`Select`/`Checkbox`: revert the
native property **synchronously inside the event handler itself**, using
`useControllableState`'s third return value:

```ts
const [current, setCurrent, isControlled] = useControllableState({ value, defaultValue, onChange })

onInput={(event) => {
  const target = event.target as HTMLInputElement
  setCurrent(target.value)
  if (isControlled) target.value = current // current = the old, still-correct prop value
  onInput?.(event)
}}
```

A `useLayoutEffect` force-sync (`mergeRefs` an internal ref, then set the DOM
property whenever it's out of sync with `current`) is kept alongside this —
it's what catches a *parent-driven* value change, which does re-render.

---

## 6. BASIC — foundation

Ships a usable, tested, on-brand primitive set. No overlays, no compound
components.

### BASIC infrastructure

- [x] `src/ui` package skeleton: own `package.json` (name, `"type": "module"`,
      `exports` map, `peerDependencies: { preact: "^10" }`, `sideEffects: false`)
- [ ] own `tsconfig.json` — deferred; `tsconfig.app.json` already covers `src/**`, a nested project reference only earns its keep at the actual NORMAL-tier extraction dress rehearsal
- [x] Token layer: `_primitive.scss` + `_semantic.scss`, compiled to `:root` CSS vars, light/dark via `prefers-color-scheme` **and** an explicit `[data-theme]` override (the app's own reset only had the media-query half); fluid `clamp()` type scale (`--font-size-sm/md/lg`) via the `fluid()` helper, mobile-first with no breakpoints
- [x] `ThemeProvider` (context + `data-theme` attribute override, no override-object support yet)
- [x] `utils/cx`, `utils/variant` (hand-rolled, shown above) — `variant()` takes the CSS-module `styles` map as a second argument to resolve class names
- [x] `utils/polymorphic` (`asPolymorphic()`) — types the dynamic `as` tag on `Box`/`Stack`/`Text` without `any`
- [x] Path aliases (`@ui/*`, `@/*`) in `tsconfig.app.json` + `vite.config.ts`, used everywhere instead of `../` parent-relative imports
- [x] Atomic-design folder tiers (`atoms/`, `molecules/`) instead of a flat `components/`
- [x] Barrel `src/ui/index.ts` — app imports only from here
- [x] `playground.html` + `src/ui/playground/Playground.tsx` — dev-only visual gallery of every component/variant/theme, wired as a second Vite entry (`build.rollupOptions.input`)

### BASIC components

- [x] **`Box`** (atom) — polymorphic layout escape hatch
  - [x] Parts: `.box` (root only)
  - [x] Variants: none — pure passthrough, no SCSS modifiers
  - [x] Props: `as`, `className`, `style`, `children`
  - [x] A11y: renders exactly as the `as` element, no implicit role
  - [x] Tests: renders custom `as` tag, forwards `className`/`style`
- [x] **`Stack`** (molecule) — flex layout primitive
  - [x] Parts: `.stack`
  - [x] Variants: `.stack--direction-{row|column}`, `.stack--align-{start|center|end|stretch}`, `.stack--justify-{start|center|end|between}`
  - [x] Tokens: `--stack-gap`
  - [x] Props: `direction`, `align`, `justify`, `gap` (`SpaceToken`), `as`
  - [x] Tests: `gap` token applied, `direction` modifier applied
- [x] **`Text`** (atom) — typography primitive
  - [x] Parts: `.text`
  - [x] Variants: `.text--size-{sm|md|lg}` (fluid `clamp()` tokens), `.text--weight-{regular|medium|bold}`, `.text--tone-{fg|fg-muted|danger}`
  - [x] Tokens: `--text-color`
  - [x] Props: `size`, `weight`, `tone`, `as` (default `span`)
  - [x] Tests: each size/tone variant applies the expected class
- [x] **`Button`** (molecule)
  - [x] Parts: `.button`, `.button__icon`, `.button__label`, `.button__spinner`
  - [x] Variants: `.button--tone-{neutral|accent|danger}`, `.button--size-{sm|md|lg}` (fluid `clamp()` font sizes)
  - [x] States: `[data-loading]`, `[disabled]`
  - [x] Tokens: `--button-bg`, `--button-fg`, `--button-border`, `--button-radius`
  - [x] Props: `tone`, `size`, `loading`, `disabled`, `as`, `className`, `style`
  - [x] A11y: native `<button>` by default, `aria-busy` when `loading`, visible `:focus-visible` ring
  - [x] Tests: tone/size variants render the right class, `disabled` blocks `onClick`, `loading` sets `aria-busy`
- [x] **`Badge`** (atom)
  - [x] Parts: `.badge`, `.badge__dot`
  - [x] Variants: `.badge--tone-{neutral|accent|success|warning|danger}`
  - [x] Tokens: `--badge-bg`, `--badge-fg`
  - [x] Props: `tone`, `children`
  - [x] A11y: renders as `<span>`, decorative dot carries `aria-hidden`
  - [x] Tests: tone variant applies class, dot hidden from the a11y tree

**Exit criteria:** `src/app.tsx` can build its hero page using only `src/ui`
components, with zero one-off CSS in `app.scss` for buttons/badges/layout.
*(Not yet done — the hero page still uses its own SCSS; the
`playground.html` gallery exists instead, showing every BASIC
component/variant/theme.)*

---

## 7. NORMAL — real product surface

### NORMAL infrastructure

- [x] Component-scoped CSS vars for every new component (`--input-border`, `--checkbox-bg`, `--switch-bg`, `--select-border`, `--field-label-color`, `--tooltip-bg`, `--popover-bg`, `--grid-gap`, `--container-max-width`, `--divider-color`)
- [x] `forwardRef` (via `preact/compat`) + the full generic `PolymorphicProps<E, P>` (§3) rolled out to every *polymorphic* component (`Box`, `Stack`, `Text`, `Grid`, `Container`) via the new `polymorphicForwardRef()` helper, replacing BASIC's `asPolymorphic()`-only version. Native form elements (`Input`, `Textarea`, `Checkbox`, `Switch`, `Select`) aren't polymorphic by design — plain `forwardRef<Element, Props>` covers them.
- [x] `useControllableState` (now also returns `isControlled` — see §5's "Controlled form elements") — controlled/uncontrolled pattern for form primitives
- [ ] ~~`useId`~~ — dropped; Preact ships `useId` natively in `preact/hooks`, a wrapper would be pure duplication
- [x] Variant matrix decision: **stayed hand-rolled** — 11 new components didn't grow the matrix enough to justify `class-variance-authority` as a real dependency
- [ ] Extraction dress rehearsal: separate Vite lib-mode build, `npm pack --dry-run` — still deferred to whenever actual extraction is scheduled, no component code depends on it
- [x] First `organisms/` component lands (`Field`, composing an atom control via `cloneElement`)
- [x] `utils/useDisclosure` + `utils/useFocusTrap` added (used by `Popover`; reusable by PREMIUM's `Dialog`/`Menu`) — not in the original infra list, needed for Popover's a11y requirements
- [x] `utils/mergeRefs` added — merges a forwarded ref with an internal one (needed wherever a component both forwards a ref and reads the DOM node itself: `Checkbox`'s indeterminate flag, every controlled form element's sync effect)

### NORMAL components

- [x] **`Input`** (atom)
  - [x] Parts: `.input`
  - [x] States: `[data-invalid]`, `[disabled]`
  - [x] Tokens: `--input-border`, `--input-bg`, `--input-fg`
  - [x] Props: `value`/`defaultValue` (via `useControllableState`), `onValueChange`, `invalid`, `disabled`, `size`
  - [x] A11y: native `<input>`; label association (`aria-describedby`/`aria-invalid`) supplied by `Field`
  - [x] Tests: controlled + uncontrolled modes, `invalid` sets `aria-invalid`
- [x] **`Textarea`** (atom)
  - [x] Parts: `.textarea`
  - [x] States: `[data-invalid]`, `[disabled]`
  - [x] Tokens: `--textarea-border`, `--textarea-bg`
  - [x] Props: same controllable pattern as `Input`, plus `rows`
  - [x] Tests: same as `Input`, plus `rows` passthrough
- [x] **`Checkbox`** (atom)
  - [x] Parts: `.checkbox`, `.checkbox__control`, `.checkbox__icon`
  - [x] States: `data-state="checked|unchecked|indeterminate"`, `[disabled]`
  - [x] Tokens: `--checkbox-bg`, `--checkbox-border`, `--checkbox-check`
  - [x] Props: `checked`/`defaultChecked`, `onCheckedChange`, `indeterminate`, `disabled`
  - [x] A11y: backed by a real `<input type="checkbox">`, never a `div` faking it; indeterminate set imperatively via ref
  - [x] Tests: controlled/uncontrolled, indeterminate sets `aria-checked="mixed"`
- [x] **`Switch`** (atom)
  - [x] Parts: `.switch`, `.switch__thumb`
  - [x] States: `data-state="checked|unchecked"`, `[disabled]`
  - [x] Tokens: `--switch-bg`, `--switch-thumb-bg`
  - [x] Props: `checked`/`defaultChecked`, `onCheckedChange`, `disabled`
  - [x] A11y: `role="switch"` + `aria-checked`; rendered as a native `<button>` so `Space`/`Enter` activation comes free, no custom keydown handling needed
  - [x] Tests: keyboard toggle, controlled/uncontrolled
- [x] **`Select`** (atom)
  - [x] Parts: `.select`
  - [x] States: `[data-invalid]`, `[disabled]`
  - [x] Tokens: `--select-border`, `--select-bg`
  - [x] Props: native `<select>` passthrough + controllable pattern, `options` convenience prop
  - [x] A11y: native `<select>` — defers listbox a11y to the browser, no custom popup at this tier
  - [x] Tests: option list renders, change fires `onValueChange` *(RTL's `fireEvent.change` doesn't reliably reach a `<select>`'s change listener in this project's jsdom version — the test dispatches manually instead; see the `ponytail:` comment in `Select.test.tsx`)*
- [x] **`Field`** (organism) — label/hint/error wrapper composing an atom control
  - [x] Parts: `.field`, `.field__label`, `.field__hint`, `.field__error`
  - [x] States: `[data-invalid]` (propagates `aria-invalid`/`aria-describedby` to the wrapped control via `cloneElement`)
  - [x] Tokens: `--field-label-color`, `--field-error-color`
  - [x] Props: `label`, `hint`, `error`, `required`, `children` (the control)
  - [x] A11y: wires `<label for>` and `aria-describedby` automatically
  - [x] Tests: error text linked via `aria-describedby`, label linked via `htmlFor`, **and** a regression test asserting `data-invalid` is *absent* (not `"false"`) when there's no error — `data-invalid={Boolean(error)}` was setting the attribute unconditionally, which still matches the presence-based `[data-invalid]` CSS selector; caught visually in the playground before it shipped
- [x] **`Grid`** (atom)
  - [x] Parts: `.grid`
  - [x] Variants: `.grid--columns-{1..12}` (generated via a Sass `@for` loop)
  - [x] Tokens: `--grid-gap`
  - [x] Props: `columns`, `gap`, `as`
  - [x] Tests: `columns` modifier applied
- [x] **`Container`** (atom)
  - [x] Parts: `.container`
  - [x] Variants: `.container--width-{sm|md|lg|full}`
  - [x] Tokens: `--container-max-width`
  - [x] Props: `width`, `as`
  - [x] Tests: `width` modifier applied
- [x] **`Divider`** (atom)
  - [x] Parts: `.divider`
  - [x] Variants: `.divider--orientation-{horizontal|vertical}`
  - [x] Tokens: `--divider-color`
  - [x] Props: `orientation`
  - [x] A11y: `role="separator"` + `aria-orientation`
  - [x] Tests: orientation modifier applied, role present
- [x] **`Tooltip`** (molecule) — trigger + content composition
  - [x] Parts: `.tooltip`, `.tooltip__trigger`, `.tooltip__content`, `.tooltip__arrow`
  - [x] States: `data-state` — *(implemented as conditional render instead; see below)*
  - [x] Tokens: `--tooltip-bg`, `--tooltip-fg`
  - [x] Props: `content`, `delay`, `placement`
  - [x] A11y: `role="tooltip"`, `aria-describedby` wired from trigger to content, dismisses on `Escape`; uses `onFocusIn`/`onFocusOut` (not `onFocus`/`onBlur`) so focus anywhere inside the trigger opens it, matching real bubbling semantics regardless of what else `preact/compat` has patched
  - [x] Tests: opens on focus after `delay`, closes on `Escape`, `aria-describedby` present *(RTL's `fireEvent.focusIn`/`mouseEnter` don't reliably bubble in this jsdom version either — tests dispatch `FocusEvent`s manually, same class of quirk as `Select`'s)*
- [x] **`Popover`** (molecule)
  - [x] Parts: `.popover`, `.popover__trigger`, `.popover__content`
  - [x] States: `data-state="open|closed"` (built on shared `useDisclosure`)
  - [x] Tokens: `--popover-bg`, `--popover-border`, `--popover-shadow`
  - [x] Props: `open`/`defaultOpen`, `onOpenChange`
  - [x] A11y: focus moves into content on open (`useFocusTrap`), returns to trigger on close, closes on outside click / `Escape`
  - [x] Tests: focus trap engages (content receives focus), outside click closes, controlled open state

**Exit criteria (revised):** the `playground.html` gallery demonstrates every
NORMAL component (`Field`-wrapped `Input`/`Textarea`/`Select`, `Checkbox`,
`Switch`, `Grid`/`Container`/`Divider`, `Tooltip`, `Popover`) alongside
BASIC's — done. Migrating `src/app.tsx`'s hero page onto `src/ui` remains
open, same as BASIC's exit criteria.

---

## 8. PREMIUM — extractable product

### PREMIUM infrastructure

- [ ] Motion tokens: CSS transition/keyframe durations & easings as tokens, respect `prefers-reduced-motion`; optional Web Animations API helper — no animation dependency
- [ ] Multi-brand theming: `ThemeOverride<ThemeTokens>` fully wired into `ThemeProvider`, runtime `data-theme` + CSS var swap, per-route/per-tenant theme
- [ ] i18n-ready primitives: zero hardcoded copy anywhere — all strings via props/slots
- [ ] Automated a11y checks in the test suite (`vitest-axe` or equivalent) on every component
- [ ] Visual regression: lightweight Playwright screenshot diff for the core set
- [ ] Real publish pipeline: Changesets for semver + changelog, `exports` map with `types`/`import`/`browser` conditions, typedoc-generated API reference
- [ ] Actual extraction: `src/ui` → `packages/ui-preact` (or standalone repo), consumed back by the app via workspace protocol, published to npm

### PREMIUM components

All PREMIUM components are compound organisms (`Component.Root/…`) and share
one block/one SCSS module per family, per the naming convention above.

- [ ] **`Tabs`** (organism)
  - [ ] Parts: `.tabs`, `.tabs__list`, `.tabs__trigger`, `.tabs__panel`, `.tabs__indicator`
  - [ ] States: `data-state="active|inactive"` on triggers/panels
  - [ ] Tokens: `--tabs-indicator-color`
  - [ ] API: `Tabs.Root value/defaultValue/onValueChange`, `Tabs.List`, `Tabs.Trigger value`, `Tabs.Panel value`
  - [ ] A11y: `role="tablist"`/`"tab"`/`"tabpanel"`, roving `tabindex`, arrow-key navigation (`useListNavigation`)
  - [ ] Tests: arrow-key nav moves selection, panel visibility follows `value`
- [ ] **`Dialog`** (organism)
  - [ ] Parts: `.dialog`, `.dialog__overlay`, `.dialog__content`, `.dialog__title`, `.dialog__close`
  - [ ] States: `data-state="open|closed"`
  - [ ] Tokens: `--dialog-overlay-bg`, `--dialog-bg`, `--dialog-shadow`
  - [ ] API: `Dialog.Root open/defaultOpen/onOpenChange`, `Dialog.Trigger`, `Dialog.Content`
  - [ ] A11y: `role="dialog"` + `aria-modal`, focus trapped and restored on close, `Escape` + overlay click close, initial focus on first focusable/close button
  - [ ] Tests: focus trap + restore, `Escape` closes, `aria-modal` present
- [ ] **`Menu`** (organism)
  - [ ] Parts: `.menu`, `.menu__trigger`, `.menu__content`, `.menu__item`, `.menu__separator`
  - [ ] States: `data-state="open|closed"` on content, `data-highlighted` on the active item
  - [ ] Tokens: `--menu-bg`, `--menu-item-highlight-bg`
  - [ ] API: `Menu.Root open/onOpenChange`, `Menu.Item onSelect/disabled`
  - [ ] A11y: `role="menu"`/`"menuitem"`, full arrow-key + typeahead navigation (`useListNavigation`), closes on select
  - [ ] Tests: typeahead jumps to matching item, `Escape`/outside click closes, disabled item unselectable
- [ ] **`Combobox`** (organism)
  - [ ] Parts: `.combobox`, `.combobox__input`, `.combobox__list`, `.combobox__option`
  - [ ] States: `data-state="open|closed"` on the list, `data-selected`/`data-highlighted` on options
  - [ ] Tokens: `--combobox-list-bg`, `--combobox-option-highlight-bg`
  - [ ] API: `value`/`onValueChange`, `inputValue`/`onInputChange`, `options`/`filter`
  - [ ] A11y: `role="combobox"` + `aria-expanded`/`aria-activedescendant`, `role="listbox"`/`"option"`, arrow-key nav
  - [ ] Tests: filtering narrows options, arrow keys move `aria-activedescendant`, Enter selects
- [ ] **`Toast`** (organism)
  - [ ] Parts: `.toast`, `.toast__title`, `.toast__description`, `.toast__close`, `.toast-viewport` (portal-mounted region — separate block, since it isn't nested under a single toast)
  - [ ] States: `data-state="open|closed"` (drives enter/exit transition), `data-type="info|success|warning|danger"`
  - [ ] Tokens: `--toast-bg`, `--toast-border`
  - [ ] API: imperative queue (`toast.show({ title, description, type, duration })`) + `ToastViewport` component to mount
  - [ ] A11y: `role="status"`/`role="alert"` depending on `type`, `aria-live` region, auto-dismiss timing respects `prefers-reduced-motion`
  - [ ] Tests: queue add/dismiss, auto-dismiss timer, `aria-live` politeness matches `type`

---

## 9. What's deliberately out of scope

- No CSS-in-JS runtime (styled-components-style) — SCSS modules + CSS vars cover both "SCSS-driven" and "code-driven" appearance without paying a runtime styling cost.
- No state-machine library (XState/Zag) — hand-rolled reducers are enough at this component count; revisit only if PREMIUM's primitive count and interaction complexity outgrow it.
- No Storybook — the `playground.html` gallery covers visual iteration at current scale.
- No `vite-tsconfig-paths` (or similar) dependency — the two alias configs (`tsconfig.app.json`, `vite.config.ts`) are small enough to keep in sync by hand.
