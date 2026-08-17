import type { ComponentChildren, CSSProperties, HTMLAttributes, JSX } from 'preact'
import type { SpaceToken } from '@ui/tokens/tokens'

export type StackDirection = 'row' | 'column'
export type StackAlign = 'start' | 'center' | 'end' | 'stretch'
export type StackJustify = 'start' | 'center' | 'end' | 'between'

export interface StackOwnProps {
  direction?: StackDirection
  align?: StackAlign
  justify?: StackJustify
  gap?: SpaceToken
  as?: keyof JSX.IntrinsicElements
  className?: string
  style?: CSSProperties
  children?: ComponentChildren
}

export type StackProps = StackOwnProps &
  Omit<HTMLAttributes<HTMLElement>, keyof StackOwnProps>
