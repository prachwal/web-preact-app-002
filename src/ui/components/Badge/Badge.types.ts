import type { ComponentChildren, JSX } from 'preact'

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

export interface BadgeOwnProps {
  tone?: BadgeTone
  className?: string
  style?: JSX.CSSProperties
  children?: ComponentChildren
}

export type BadgeProps = BadgeOwnProps &
  Omit<JSX.HTMLAttributes<HTMLSpanElement>, keyof BadgeOwnProps>
