import type { ComponentChildren, CSSProperties } from 'preact'
import type { ElementTag, PolymorphicProps } from '@ui/utils/polymorphic'
import type { SpaceToken } from '@ui/tokens/tokens'

export type StackDirection = 'row' | 'column'
export type StackAlign = 'start' | 'center' | 'end' | 'stretch'
export type StackJustify = 'start' | 'center' | 'end' | 'between'

export interface StackOwnProps {
  direction?: StackDirection
  align?: StackAlign
  justify?: StackJustify
  gap?: SpaceToken
  className?: string
  style?: CSSProperties
  children?: ComponentChildren
}

export type StackProps<E extends ElementTag = 'div'> = PolymorphicProps<E, StackOwnProps>
