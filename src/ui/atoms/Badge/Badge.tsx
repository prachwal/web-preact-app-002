import { cx } from '@ui/utils/cx'
import { variant } from '@ui/utils/variant'
import styles from './Badge.module.scss'
import type { BadgeProps } from './Badge.types'

const badgeVariant = variant({
  base: 'badge',
  variants: {
    tone: {
      neutral: 'badge--tone-neutral',
      accent: 'badge--tone-accent',
      success: 'badge--tone-success',
      warning: 'badge--tone-warning',
      danger: 'badge--tone-danger',
    },
  },
  defaultVariants: { tone: 'neutral' },
})

export function Badge({ tone, className, children, ...rest }: BadgeProps) {
  return (
    <span class={cx(badgeVariant(styles, { tone }), className)} {...rest}>
      <span class={styles.badge__dot} aria-hidden="true" />
      {children}
    </span>
  )
}
