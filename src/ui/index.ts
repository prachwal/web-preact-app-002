// Public barrel — the only import surface app code should reach through.
// Never import from `src/ui/components/*/*.tsx` directly outside this file.

export { Box } from './components/Box'
export type { BoxProps, BoxOwnProps } from './components/Box'

export { Stack } from './components/Stack'
export type {
  StackProps,
  StackOwnProps,
  StackDirection,
  StackAlign,
  StackJustify,
} from './components/Stack'

export { Text } from './components/Text'
export type { TextProps, TextOwnProps, TextSize, TextWeight, TextTone } from './components/Text'

export { Button } from './components/Button'
export type { ButtonProps, ButtonOwnProps, ButtonTone, ButtonSize } from './components/Button'

export { Badge } from './components/Badge'
export type { BadgeProps, BadgeOwnProps, BadgeTone } from './components/Badge'

export { ThemeProvider, useTheme } from './theme/ThemeProvider'
export type { ThemeProviderProps, ThemeMode, ThemeContextValue } from './theme/theme.types'

export { cx } from './utils/cx'
export { variant } from './utils/variant'

export type { ColorToken, SpaceToken, RadiusToken, ThemeTokens, ThemeOverride } from './tokens/tokens'
export { space, radius, color } from './tokens/tokens'
