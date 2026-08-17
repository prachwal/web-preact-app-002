import { forwardRef } from 'preact/compat'
import { cx } from '@ui/utils/cx'
import { variant } from '@ui/utils/variant'
import styles from './Button.module.scss'
import type { ButtonProps } from './Button.types'

const buttonVariant = variant({
  base: 'button',
  variants: {
    tone: {
      neutral: 'button--tone-neutral',
      accent: 'button--tone-accent',
      danger: 'button--tone-danger',
    },
    size: {
      sm: 'button--size-sm',
      md: 'button--size-md',
      lg: 'button--size-lg',
    },
  },
  defaultVariants: { tone: 'accent', size: 'md' },
})

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { tone, size, loading, disabled, icon, className, children, onClick, ...rest },
  ref,
) {
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      type="button"
      class={cx(buttonVariant(styles, { tone, size }), className)}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      // native `disabled` alone isn't reliably respected by every synthetic
      // event source (e.g. jsdom's fireEvent), so guard explicitly too
      onClick={isDisabled ? undefined : onClick}
      {...rest}
    >
      {loading ? (
        <span class={styles.button__spinner} aria-hidden="true" />
      ) : (
        icon && <span class={styles.button__icon}>{icon}</span>
      )}
      <span class={styles.button__label}>{children}</span>
    </button>
  )
})
