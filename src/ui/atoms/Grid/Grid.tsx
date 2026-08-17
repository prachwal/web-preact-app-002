import { cx } from '@ui/utils/cx'
import { asPolymorphic, polymorphicForwardRef } from '@ui/utils/polymorphic'
import styles from './Grid.module.scss'
import type { GridOwnProps } from './Grid.types'

export const Grid = polymorphicForwardRef<GridOwnProps>(function Grid(
  { as: tag = 'div', columns, gap, className, style, ...rest },
  ref,
) {
  const Tag = asPolymorphic(tag)
  return (
    <Tag
      ref={ref}
      class={cx(styles.grid, columns != null && styles[`grid--columns-${columns}`], className)}
      style={{
        ...(gap != null && { '--grid-gap': `var(--space-${gap})` }),
        ...style,
      }}
      {...rest}
    />
  )
})
