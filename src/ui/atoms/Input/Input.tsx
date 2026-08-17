import { forwardRef } from 'preact/compat'
import { useLayoutEffect, useRef } from 'preact/hooks'
import { cx } from '@ui/utils/cx'
import { mergeRefs } from '@ui/utils/mergeRefs'
import { useControllableState } from '@ui/utils/useControllableState'
import { variant } from '@ui/utils/variant'
import styles from './Input.module.scss'
import type { InputProps } from './Input.types'

const inputVariant = variant({
  base: 'input',
  variants: { size: { sm: 'input--size-sm', md: 'input--size-md', lg: 'input--size-lg' } },
  defaultVariants: { size: 'md' },
})

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { value, defaultValue = '', onValueChange, invalid, size, className, onInput, ...rest },
  ref,
) {
  const [current, setCurrent, isControlled] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const innerRef = useRef<HTMLInputElement>(null)

  // A parent-driven `value` change re-renders with a new prop, but Preact
  // still skips reapplying the DOM property if the vnode value happens to
  // match what's already there — force-sync defensively.
  useLayoutEffect(() => {
    if (innerRef.current && innerRef.current.value !== current) innerRef.current.value = current
  })

  return (
    <input
      ref={mergeRefs(ref, innerRef)}
      class={cx(inputVariant(styles, { size }), className)}
      value={current}
      data-invalid={invalid || undefined}
      aria-invalid={invalid || undefined}
      onInput={(event) => {
        const target = event.target as HTMLInputElement
        setCurrent(target.value)
        // When controlled and the caller doesn't change `value`, no
        // re-render happens to catch the browser's native mutation — revert
        // it synchronously right here instead of waiting on an effect.
        if (isControlled) target.value = current
        onInput?.(event)
      }}
      {...rest}
    />
  )
})
