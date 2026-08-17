import type { InputHTMLAttributes } from 'preact'

export type InputSize = 'sm' | 'md' | 'lg'

export interface InputOwnProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  invalid?: boolean
  size?: InputSize
  className?: string
}

export type InputProps = InputOwnProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, keyof InputOwnProps>
