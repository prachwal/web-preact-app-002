// TS mirror of the semantic token names defined in _semantic.scss — gives
// typed access to token keys without hardcoding CSS var strings everywhere.

export type ColorToken =
  | 'bg'
  | 'bg-subtle'
  | 'surface'
  | 'fg'
  | 'fg-muted'
  | 'border'
  | 'accent'
  | 'accent-fg'
  | 'danger'
  | 'success'
  | 'warning'

export type SpaceToken = 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16 | 24 | 32
export type RadiusToken = 'sm' | 'md' | 'lg' | 'full'

export interface ThemeTokens {
  color: Record<ColorToken, string>
  space: Record<SpaceToken, string>
  radius: Record<RadiusToken, string>
  font: { sans: string; mono: string }
}

export type ThemeOverride<T> = {
  [K in keyof T]?: T[K] extends object ? ThemeOverride<T[K]> : T[K]
}

export const space = (token: SpaceToken): string => `var(--space-${token})`
export const radius = (token: RadiusToken): string => `var(--radius-${token})`
export const color = (token: ColorToken): string => `var(--color-${token})`
