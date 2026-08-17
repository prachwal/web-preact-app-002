import { cx } from '@ui/utils/cx'
import { asPolymorphic, polymorphicForwardRef } from '@ui/utils/polymorphic'
import { variant } from '@ui/utils/variant'
import styles from './Container.module.scss'
import type { ContainerOwnProps } from './Container.types'

const containerVariant = variant({
  base: 'container',
  variants: {
    width: {
      sm: 'container--width-sm',
      md: 'container--width-md',
      lg: 'container--width-lg',
      full: 'container--width-full',
    },
  },
})

export const Container = polymorphicForwardRef<ContainerOwnProps>(function Container(
  { as: tag = 'div', width, className, ...rest },
  ref,
) {
  const Tag = asPolymorphic(tag)
  return <Tag ref={ref} class={cx(containerVariant(styles, { width }), className)} {...rest} />
})
