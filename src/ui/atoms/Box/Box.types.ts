import type { ComponentChildren, CSSProperties, HTMLAttributes, JSX } from 'preact'

export interface BoxOwnProps {
  as?: keyof JSX.IntrinsicElements
  className?: string
  style?: CSSProperties
  children?: ComponentChildren
}

export type BoxProps = BoxOwnProps &
  Omit<HTMLAttributes<HTMLElement>, keyof BoxOwnProps>
