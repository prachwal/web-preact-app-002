import type { ComponentChildren, JSX } from 'preact'

export interface BoxOwnProps {
  as?: keyof JSX.IntrinsicElements
  className?: string
  style?: JSX.CSSProperties
  children?: ComponentChildren
}

export type BoxProps = BoxOwnProps &
  Omit<JSX.HTMLAttributes<HTMLElement>, keyof BoxOwnProps>
