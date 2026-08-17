// Public barrel — the only import surface app code should reach through.
// Never import from `src/ui/{atoms,molecules,organisms}/*/*.tsx` directly
// outside this file.
//
// Tiered by complexity (atomic design): atoms are single-purpose style
// primitives, molecules combine atoms/state into one reusable control,
// organisms (NORMAL/PREMIUM) will be multi-part compound components.

// --- atoms ---
export { Box } from '@ui/atoms/Box'
export type { BoxProps, BoxOwnProps } from '@ui/atoms/Box'

export { Text } from '@ui/atoms/Text'
export type { TextProps, TextOwnProps, TextSize, TextWeight, TextTone } from '@ui/atoms/Text'

export { Badge } from '@ui/atoms/Badge'
export type { BadgeProps, BadgeOwnProps, BadgeTone } from '@ui/atoms/Badge'

// --- molecules ---
export { Stack } from '@ui/molecules/Stack'
export type {
  StackProps,
  StackOwnProps,
  StackDirection,
  StackAlign,
  StackJustify,
} from '@ui/molecules/Stack'

export { Button } from '@ui/molecules/Button'
export type { ButtonProps, ButtonOwnProps, ButtonTone, ButtonSize } from '@ui/molecules/Button'

// --- theme ---
export { ThemeProvider, useTheme } from '@ui/theme/ThemeProvider'
export type { ThemeProviderProps, ThemeMode, ThemeContextValue } from '@ui/theme/theme.types'

// --- utils ---
export { cx } from '@ui/utils/cx'
export { variant } from '@ui/utils/variant'

// --- tokens ---
export type { ColorToken, SpaceToken, RadiusToken, ThemeTokens, ThemeOverride } from '@ui/tokens/tokens'
export { space, radius, color } from '@ui/tokens/tokens'
