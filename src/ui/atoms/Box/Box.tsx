import { forwardRef } from 'preact/compat'
import { cx } from '@ui/utils/cx'
import { asPolymorphic } from '@ui/utils/polymorphic'
import styles from './Box.module.scss'
import type { BoxProps } from './Box.types'

/** Polymorphic layout escape hatch — renders whatever `as` says, nothing more. */
export const Box = forwardRef<HTMLElement, BoxProps>(function Box(
  { as: tag = 'div', className, ...rest },
  ref,
) {
  const Tag = asPolymorphic(tag)
  return <Tag ref={ref} class={cx(styles.box, className)} {...rest} />
})
