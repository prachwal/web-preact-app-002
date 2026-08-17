import { cloneElement } from 'preact'
import { useId } from 'preact/hooks'
import { cx } from '@ui/utils/cx'
import styles from './Field.module.scss'
import type { FieldProps } from './Field.types'

/** Label/hint/error wrapper — wires htmlFor/aria-describedby/aria-invalid onto the wrapped control automatically. */
export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  const control = cloneElement(children, {
    id,
    'aria-describedby': describedBy,
    'aria-invalid': Boolean(error),
    // `[data-invalid]` is a presence-based CSS selector — `data-invalid="false"`
    // would still match it, so omit the attribute entirely instead of falsing it.
    'data-invalid': error ? true : undefined,
  })

  return (
    <div class={cx(styles.field, className)} data-invalid={error ? true : undefined}>
      <label class={styles.field__label} for={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {control}
      {hint && !error && (
        <p class={styles.field__hint} id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p class={styles.field__error} id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
