import { forwardRef } from 'preact/compat'
import { useLayoutEffect, useRef } from 'preact/hooks'
import { cx } from '@ui/utils/cx'
import { mergeRefs } from '@ui/utils/mergeRefs'
import { useControllableState } from '@ui/utils/useControllableState'
import styles from './Checkbox.module.scss'
import type { CheckboxProps } from './Checkbox.types'

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { checked, defaultChecked = false, onCheckedChange, indeterminate, className, onChange, ...rest },
  ref,
) {
  const [current, setCurrent, isControlled] = useControllableState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  })
  const innerRef = useRef<HTMLInputElement>(null)

  // see Input.tsx — parent-driven changes still need a defensive force-sync
  useLayoutEffect(() => {
    if (!innerRef.current) return
    innerRef.current.indeterminate = Boolean(indeterminate)
    if (innerRef.current.checked !== current) innerRef.current.checked = current
  })

  const state = indeterminate ? 'indeterminate' : current ? 'checked' : 'unchecked'

  return (
    <span class={cx(styles.checkbox, className)} data-state={state}>
      <input
        ref={mergeRefs(ref, innerRef)}
        type="checkbox"
        class={styles.checkbox__control}
        checked={current}
        aria-checked={indeterminate ? 'mixed' : current}
        onChange={(event) => {
          const target = event.target as HTMLInputElement
          setCurrent(target.checked)
          // see Input.tsx — synchronous revert when controlled and unchanged
          if (isControlled) target.checked = current
          onChange?.(event)
        }}
        {...rest}
      />
      <svg class={styles.checkbox__icon} aria-hidden="true" viewBox="0 0 16 16">
        {indeterminate ? (
          <line x1="4" y1="8" x2="12" y2="8" stroke="currentColor" stroke-width="2" />
        ) : (
          current && <path d="M3 8l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2" />
        )}
      </svg>
    </span>
  )
})
