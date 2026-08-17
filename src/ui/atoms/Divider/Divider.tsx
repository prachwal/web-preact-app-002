import { cx } from '@ui/utils/cx'
import { variant } from '@ui/utils/variant'
import styles from './Divider.module.scss'
import type { DividerProps } from './Divider.types'

const dividerVariant = variant({
  base: 'divider',
  variants: {
    orientation: {
      horizontal: 'divider--orientation-horizontal',
      vertical: 'divider--orientation-vertical',
    },
  },
  defaultVariants: { orientation: 'horizontal' },
})

export function Divider({ orientation, className, ...rest }: DividerProps) {
  return (
    <hr
      class={cx(dividerVariant(styles, { orientation }), className)}
      role="separator"
      aria-orientation={orientation ?? 'horizontal'}
      {...rest}
    />
  )
}
