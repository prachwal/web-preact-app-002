import type { SelectHTMLAttributes } from 'preact'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectOwnProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  invalid?: boolean
  options?: SelectOption[]
  /** rendered as a disabled placeholder option when nothing is selected yet — without one, an unselected native <select> just renders blank (no legible empty state), unlike Input/Textarea/Combobox's `placeholder` */
  placeholder?: string
  className?: string
}

export type SelectProps = SelectOwnProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, keyof SelectOwnProps>
