import type { ButtonHTMLAttributes, ComponentChildren, CSSProperties } from 'preact'

export type ButtonTone = 'neutral' | 'accent' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonOwnProps {
  tone?: ButtonTone
  size?: ButtonSize
  loading?: boolean
  icon?: ComponentChildren
  /** escape hatch for code-driven appearance, merged after variant classes */
  className?: string
  /** escape hatch for one-off CSS var overrides, e.g. { '--button-bg': '#111' } */
  style?: CSSProperties
  children?: ComponentChildren
}

export type ButtonProps = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps>
