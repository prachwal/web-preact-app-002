import type { ComponentChildren, JSX } from 'preact'

export type TextSize = 'sm' | 'md' | 'lg'
export type TextWeight = 'regular' | 'medium' | 'bold'
export type TextTone = 'fg' | 'fg-muted' | 'danger'

export interface TextOwnProps {
  size?: TextSize
  weight?: TextWeight
  tone?: TextTone
  as?: keyof JSX.IntrinsicElements
  className?: string
  style?: JSX.CSSProperties
  children?: ComponentChildren
}

export type TextProps = TextOwnProps &
  Omit<JSX.HTMLAttributes<HTMLElement>, keyof TextOwnProps>
