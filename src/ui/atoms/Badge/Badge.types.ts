import type { ComponentChildren, CSSProperties, HTMLAttributes } from 'preact'

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

export interface BadgeOwnProps {
  tone?: BadgeTone
  className?: string
  style?: CSSProperties
  children?: ComponentChildren
}

export type BadgeProps = BadgeOwnProps &
  Omit<HTMLAttributes<HTMLSpanElement>, keyof BadgeOwnProps>
