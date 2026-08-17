import type { ButtonHTMLAttributes } from 'preact'

export interface SwitchOwnProps {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
}

export type SwitchProps = SwitchOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof SwitchOwnProps | 'type'>
