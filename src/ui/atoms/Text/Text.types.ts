import type { ComponentChildren, CSSProperties } from 'preact'
import type { ElementTag, PolymorphicProps } from '@ui/utils/polymorphic'

export type TextSize = 'sm' | 'md' | 'lg'
export type TextWeight = 'regular' | 'medium' | 'bold'
export type TextTone = 'fg' | 'fg-muted' | 'danger'

export interface TextOwnProps {
  size?: TextSize
  weight?: TextWeight
  tone?: TextTone
  className?: string
  style?: CSSProperties
  children?: ComponentChildren
}

export type TextProps<E extends ElementTag = 'span'> = PolymorphicProps<E, TextOwnProps>
