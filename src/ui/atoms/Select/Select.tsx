import { forwardRef } from 'preact/compat'
import { useLayoutEffect, useRef } from 'preact/hooks'
import { cx } from '@ui/utils/cx'
import { mergeRefs } from '@ui/utils/mergeRefs'
import { useControllableState } from '@ui/utils/useControllableState'
import styles from './Select.module.scss'
import type { SelectProps } from './Select.types'

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { value, defaultValue = '', onValueChange, invalid, options, className, onChange, children, ...rest },
  ref,
) {
  const [current, setCurrent, isControlled] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const innerRef = useRef<HTMLSelectElement>(null)

  // see Input.tsx — parent-driven changes still need a defensive force-sync
  useLayoutEffect(() => {
    if (innerRef.current && innerRef.current.value !== current) innerRef.current.value = current
  })

  return (
    <select
      ref={mergeRefs(ref, innerRef)}
      class={cx(styles.select, className)}
      value={current}
      data-invalid={invalid || undefined}
      aria-invalid={invalid || undefined}
      onChange={(event) => {
        const target = event.target as HTMLSelectElement
        setCurrent(target.value)
        // see Input.tsx — synchronous revert when controlled and unchanged
        if (isControlled) target.value = current
        onChange?.(event)
      }}
      {...rest}
    >
      {options
        ? options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))
        : children}
    </select>
  )
})
