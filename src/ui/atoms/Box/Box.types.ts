import type { ComponentChildren, CSSProperties } from 'preact'
import type { ElementTag, PolymorphicProps } from '@ui/utils/polymorphic'

export interface BoxOwnProps {
  className?: string
  style?: CSSProperties
  children?: ComponentChildren
}

export type BoxProps<E extends ElementTag = 'div'> = PolymorphicProps<E, BoxOwnProps>
