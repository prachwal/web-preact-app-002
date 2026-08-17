import type { ComponentChildren, CSSProperties } from 'preact'
import type { ElementTag, PolymorphicProps } from '@ui/utils/polymorphic'
import type { SpaceToken } from '@ui/tokens/tokens'

export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export interface GridOwnProps {
  columns?: GridColumns
  gap?: SpaceToken
  className?: string
  style?: CSSProperties
  children?: ComponentChildren
}

export type GridProps<E extends ElementTag = 'div'> = PolymorphicProps<E, GridOwnProps>
