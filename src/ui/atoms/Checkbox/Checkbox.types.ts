import type { InputHTMLAttributes } from 'preact'

export interface CheckboxOwnProps {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  indeterminate?: boolean
  className?: string
}

export type CheckboxProps = CheckboxOwnProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, keyof CheckboxOwnProps | 'type'>
