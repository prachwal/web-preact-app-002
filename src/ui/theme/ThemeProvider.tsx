import { createContext } from 'preact'
import { useContext, useEffect } from 'preact/hooks'
import type { ThemeContextValue, ThemeProviderProps } from './theme.types'

const ThemeContext = createContext<ThemeContextValue>({ theme: 'system' })

/**
 * Sets `data-theme` on the document root so the CSS in
 * `tokens/_semantic.scss` can pick the right palette. `theme="system"`
 * (the default) clears the attribute and lets `prefers-color-scheme` decide.
 */
export function ThemeProvider({ theme = 'system', children }: ThemeProviderProps) {
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', theme)
  }, [theme])

  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}
