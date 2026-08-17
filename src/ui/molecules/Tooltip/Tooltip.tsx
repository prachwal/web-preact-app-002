import { useId, useRef, useState } from 'preact/hooks'
import { cx } from '@ui/utils/cx'
import { variant } from '@ui/utils/variant'
import styles from './Tooltip.module.scss'
import type { TooltipProps } from './Tooltip.types'

const contentVariant = variant({
  base: 'tooltip__content',
  variants: {
    placement: {
      top: 'tooltip__content--top',
      bottom: 'tooltip__content--bottom',
    },
  },
  defaultVariants: { placement: 'top' },
})

export function Tooltip({ content, delay = 300, placement, children, className }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)
  const id = useId()

  const show = () => {
    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => setOpen(true), delay)
  }
  const hide = () => {
    window.clearTimeout(timeoutRef.current)
    setOpen(false)
  }

  return (
    <span
      class={cx(styles.tooltip, className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      // bubbling focusin/focusout (not focus/blur) so focus anywhere inside
      // the trigger opens the tooltip, regardless of what preact/compat
      // happens to have loaded elsewhere in the bundle
      onFocusIn={show}
      onFocusOut={hide}
      onKeyDown={(event) => {
        if (event.key === 'Escape') hide()
      }}
    >
      <span class={styles.tooltip__trigger} aria-describedby={open ? id : undefined}>
        {children}
      </span>
      {open && (
        <span role="tooltip" id={id} class={contentVariant(styles, { placement })}>
          {content}
          <span class={styles.tooltip__arrow} aria-hidden="true" />
        </span>
      )}
    </span>
  )
}
