import type { InputHTMLAttributes } from 'preact'

export interface ComboboxOption {
  value: string
  label: string
}

export interface ComboboxOwnProps {
  value?: string
  onValueChange?: (value: string) => void
  inputValue?: string
  onInputChange?: (value: string) => void
  options: ComboboxOption[]
  filter?: (option: ComboboxOption, inputValue: string) => boolean
  className?: string
}

export type ComboboxProps = ComboboxOwnProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, keyof ComboboxOwnProps | 'value' | 'role'>
