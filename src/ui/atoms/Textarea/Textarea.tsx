import { forwardRef } from 'preact/compat'
import { useLayoutEffect, useRef } from 'preact/hooks'
import { cx } from '@ui/utils/cx'
import { mergeRefs } from '@ui/utils/mergeRefs'
import { useControllableState } from '@ui/utils/useControllableState'
import styles from './Textarea.module.scss'
import type { TextareaProps } from './Textarea.types'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { value, defaultValue = '', onValueChange, invalid, className, onInput, ...rest },
  ref,
) {
  const [current, setCurrent, isControlled] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const innerRef = useRef<HTMLTextAreaElement>(null)

  // see Input.tsx — parent-driven changes still need a defensive force-sync
  useLayoutEffect(() => {
    if (innerRef.current && innerRef.current.value !== current) innerRef.current.value = current
  })

  return (
    <textarea
      ref={mergeRefs(ref, innerRef)}
      class={cx(styles.textarea, className)}
      value={current}
      data-invalid={invalid || undefined}
      aria-invalid={invalid || undefined}
      onInput={(event) => {
        const target = event.target as HTMLTextAreaElement
        setCurrent(target.value)
        // see Input.tsx — synchronous revert when controlled and unchanged
        if (isControlled) target.value = current
        onInput?.(event)
      }}
      {...rest}
    />
  )
})
