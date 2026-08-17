import { cx } from '@ui/utils/cx'
import { asPolymorphic, polymorphicForwardRef } from '@ui/utils/polymorphic'
import { variant } from '@ui/utils/variant'
import styles from './Stack.module.scss'
import type { StackOwnProps } from './Stack.types'

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
export const Stack = polymorphicForwardRef<StackOwnProps>(function Stack(
  { as: tag = 'div', direction, align, justify, gap, className, style, ...rest },
  ref,
) {
  const Tag = asPolymorphic(tag)
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
