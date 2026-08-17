import { forwardRef } from 'preact/compat'
import { cx } from '@ui/utils/cx'
import { useControllableState } from '@ui/utils/useControllableState'
import styles from './Switch.module.scss'
import type { SwitchProps } from './Switch.types'

/** Accessible toggle rendered as a native `<button role="switch">` — Space/Enter activation comes for free. */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked, defaultChecked = false, onCheckedChange, className, onClick, disabled, ...rest },
  ref,
) {
  const [current, setCurrent] = useControllableState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  })

  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={current}
      disabled={disabled}
      data-state={current ? 'checked' : 'unchecked'}
      class={cx(styles.switch, className)}
      onClick={(event) => {
        setCurrent(!current)
        onClick?.(event)
      }}
      {...rest}
    >
      <span class={styles.switch__thumb} />
    </button>
  )
})
