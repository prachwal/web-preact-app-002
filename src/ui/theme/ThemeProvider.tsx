import { createContext } from 'preact'
import { useContext, useEffect } from 'preact/hooks'
import type { ThemeContextValue, ThemeProviderProps } from './theme.types'

const ThemeContext = createContext<ThemeContextValue>({ theme: 'system' })

/** Recursively flattens a ThemeOverride into `--<path>-<key>` CSS var names, matching the token naming convention (`color.accent` → `--color-accent`, `space[4]` → `--space-4`). */
function applyOverride(
  root: HTMLElement,
  node: Record<string, unknown>,
  path: string[],
  applied: string[],
): void {
  for (const key in node) {
    const value = node[key]
    if (value != null && typeof value === 'object') {
      applyOverride(root, value as Record<string, unknown>, [...path, key], applied)
    } else if (value != null) {
      const varName = `--${[...path, key].join('-')}`
      root.style.setProperty(varName, String(value))
      applied.push(varName)
    }
  }
}

/**
 * Sets `data-theme` on the document root so the CSS in
 * `tokens/_semantic.scss` can pick the right palette. `theme="system"`
 * (the default) clears the attribute and lets `prefers-color-scheme` decide.
 *
 * `override` layers per-brand/per-tenant token values on top as inline CSS
 * custom properties on the root — still a *global* swap (same mechanism as
 * `data-theme`), not scoped to a subtree; nest a second `ThemeProvider`
 * lower in the tree if two different overrides need to coexist on screen at
 * once, same limitation `data-theme` already has.
 */
export function ThemeProvider({ theme = 'system', override, children }: ThemeProviderProps) {
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!override) return
    const root = document.documentElement
    const applied: string[] = []
    applyOverride(root, override, [], applied)
    return () => {
      for (const varName of applied) root.style.removeProperty(varName)
    }
  }, [override])

  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}
