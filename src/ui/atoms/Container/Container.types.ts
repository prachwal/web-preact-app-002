import type { ComponentChildren, CSSProperties } from 'preact'
import type { ElementTag, PolymorphicProps } from '@ui/utils/polymorphic'

export type ContainerWidth = 'sm' | 'md' | 'lg' | 'full'

export interface ContainerOwnProps {
  width?: ContainerWidth
  className?: string
  style?: CSSProperties
  children?: ComponentChildren
}

export type ContainerProps<E extends ElementTag = 'div'> = PolymorphicProps<E, ContainerOwnProps>
