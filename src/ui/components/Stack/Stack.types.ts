import type { ComponentChildren, JSX } from 'preact'
import type { SpaceToken } from '../../tokens/tokens'

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
  style?: JSX.CSSProperties
  children?: ComponentChildren
}

export type StackProps = StackOwnProps &
  Omit<JSX.HTMLAttributes<HTMLElement>, keyof StackOwnProps>
