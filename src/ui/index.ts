// Public barrel — the only import surface app code should reach through.
// Never import from `src/ui/{atoms,molecules,organisms}/*/*.tsx` directly
// outside this file.
//
// Tiered by complexity (atomic design): atoms are single-purpose style
// primitives, molecules combine atoms/state into one reusable control,
// organisms are multi-part compound components.

// --- atoms ---
export { Box } from '@ui/atoms/Box'
export type { BoxProps, BoxOwnProps } from '@ui/atoms/Box'

export { Text } from '@ui/atoms/Text'
export type { TextProps, TextOwnProps, TextSize, TextWeight, TextTone } from '@ui/atoms/Text'

export { Badge } from '@ui/atoms/Badge'
export type { BadgeProps, BadgeOwnProps, BadgeTone } from '@ui/atoms/Badge'

export { Input } from '@ui/atoms/Input'
export type { InputProps, InputOwnProps, InputSize } from '@ui/atoms/Input'

export { Textarea } from '@ui/atoms/Textarea'
export type { TextareaProps, TextareaOwnProps } from '@ui/atoms/Textarea'

export { Checkbox } from '@ui/atoms/Checkbox'
export type { CheckboxProps, CheckboxOwnProps } from '@ui/atoms/Checkbox'

export { Switch } from '@ui/atoms/Switch'
export type { SwitchProps, SwitchOwnProps } from '@ui/atoms/Switch'

export { Select } from '@ui/atoms/Select'
export type { SelectProps, SelectOwnProps, SelectOption } from '@ui/atoms/Select'

export { Grid } from '@ui/atoms/Grid'
export type { GridProps, GridOwnProps, GridColumns } from '@ui/atoms/Grid'

export { Container } from '@ui/atoms/Container'
export type { ContainerProps, ContainerOwnProps, ContainerWidth } from '@ui/atoms/Container'

export { Divider } from '@ui/atoms/Divider'
export type { DividerProps, DividerOwnProps, DividerOrientation } from '@ui/atoms/Divider'

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

export { Tooltip } from '@ui/molecules/Tooltip'
export type { TooltipProps, TooltipOwnProps, TooltipPlacement } from '@ui/molecules/Tooltip'

export { Popover } from '@ui/molecules/Popover'
export type { PopoverProps, PopoverOwnProps } from '@ui/molecules/Popover'

// --- organisms ---
export { Field } from '@ui/organisms/Field'
export type { FieldProps, FieldOwnProps, FieldControlProps } from '@ui/organisms/Field'

export { Tabs } from '@ui/organisms/Tabs'
export type {
  TabsRootProps,
  TabsListProps,
  TabsTriggerProps,
  TabsPanelProps,
} from '@ui/organisms/Tabs'

export { Dialog } from '@ui/organisms/Dialog'
export type {
  DialogRootProps,
  DialogTriggerProps,
  DialogContentProps,
  DialogTitleProps,
  DialogCloseProps,
} from '@ui/organisms/Dialog'

export { Menu } from '@ui/organisms/Menu'
export type { MenuRootProps, MenuTriggerProps, MenuContentProps, MenuItemProps } from '@ui/organisms/Menu'

export { Combobox } from '@ui/organisms/Combobox'
export type { ComboboxProps, ComboboxOwnProps, ComboboxOption } from '@ui/organisms/Combobox'

export { ToastViewport, toast } from '@ui/organisms/Toast'
export type { ToastItem, ToastInput, ToastType, ToastViewportProps } from '@ui/organisms/Toast'

// --- theme ---
export { ThemeProvider, useTheme } from '@ui/theme/ThemeProvider'
export type { ThemeProviderProps, ThemeMode, ThemeContextValue } from '@ui/theme/theme.types'

// --- utils ---
export { cx } from '@ui/utils/cx'
export { variant } from '@ui/utils/variant'
export { useControllableState } from '@ui/utils/useControllableState'
export { useDisclosure } from '@ui/utils/useDisclosure'
export { useFocusTrap } from '@ui/utils/useFocusTrap'
export { mergeRefs } from '@ui/utils/mergeRefs'
export { prefersReducedMotion, animateIfAllowed } from '@ui/utils/motion'
export type { ElementTag, PolymorphicProps } from '@ui/utils/polymorphic'

// --- tokens ---
export type { ColorToken, SpaceToken, RadiusToken, ThemeTokens, ThemeOverride } from '@ui/tokens/tokens'
export { space, radius, color } from '@ui/tokens/tokens'
