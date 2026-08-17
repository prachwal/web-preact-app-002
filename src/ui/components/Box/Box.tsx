import { forwardRef } from 'preact/compat'
import { cx } from '../../utils/cx'
import styles from './Box.module.scss'
import type { BoxProps } from './Box.types'

/** Polymorphic layout escape hatch — renders whatever `as` says, nothing more. */
export const Box = forwardRef<HTMLElement, BoxProps>(function Box(
  { as: Component = 'div', className, ...rest },
  ref,
) {
  // `as` makes the JSX tag dynamic — TS can't narrow the resulting
  // intrinsic-element union, so this one boundary is intentionally untyped.
  const Tag = Component as any
  return <Tag ref={ref} class={cx(styles.box, className)} {...rest} />
})
