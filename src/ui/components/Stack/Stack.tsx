import { forwardRef } from 'preact/compat'
import { cx } from '../../utils/cx'
import { variant } from '../../utils/variant'
import styles from './Stack.module.scss'
import type { StackProps } from './Stack.types'

const stackVariant = variant({
  base: 'stack',
  variants: {
    direction: {
      row: 'stack--direction-row',
      column: 'stack--direction-column',
    },
    align: {
      start: 'stack--align-start',
      center: 'stack--align-center',
      end: 'stack--align-end',
      stretch: 'stack--align-stretch',
    },
    justify: {
      start: 'stack--justify-start',
      center: 'stack--justify-center',
      end: 'stack--justify-end',
      between: 'stack--justify-between',
    },
  },
  defaultVariants: { direction: 'column' },
})

/** Flex layout primitive — direction/align/justify as props, gap from the space scale. */
export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  { as: Component = 'div', direction, align, justify, gap, className, style, ...rest },
  ref,
) {
  // `as` makes the JSX tag dynamic — TS can't narrow the resulting
  // intrinsic-element union, so this one boundary is intentionally untyped.
  const Tag = Component as any
  return (
    <Tag
      ref={ref}
      class={cx(stackVariant(styles, { direction, align, justify }), className)}
      style={{
        ...(gap != null && { '--stack-gap': `var(--space-${gap})` }),
        ...style,
      }}
      {...rest}
    />
  )
})
