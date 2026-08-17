import type { ComponentChildren } from 'preact'
import type { ThemeOverride, ThemeTokens } from '@ui/tokens/tokens'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeProviderProps {
  theme?: ThemeMode
  /** reserved for NORMAL+ — full token overrides aren't wired into the CSS yet */
  override?: ThemeOverride<ThemeTokens>
  children?: ComponentChildren
}

export interface ThemeContextValue {
  theme: ThemeMode
}
