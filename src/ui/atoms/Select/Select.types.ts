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
  className?: string
}

export type SelectProps = SelectOwnProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, keyof SelectOwnProps>
