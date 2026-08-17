import { useEffect, useRef } from 'preact/hooks'
import { cx } from '@ui/utils/cx'
import { useDisclosure } from '@ui/utils/useDisclosure'
import { useFocusTrap } from '@ui/utils/useFocusTrap'
import styles from './Popover.module.scss'
import type { PopoverProps } from './Popover.types'

export function Popover({
  trigger,
  open: openProp,
  defaultOpen,
  onOpenChange,
  className,
  children,
}: PopoverProps) {
  const { open, hide, toggle } = useDisclosure({ open: openProp, defaultOpen, onOpenChange })
  const rootRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  useFocusTrap(contentRef, open)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) hide()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hide()
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, hide])

  return (
    <div ref={rootRef} class={cx(styles.popover, className)} data-state={open ? 'open' : 'closed'}>
      <span class={styles.popover__trigger} onClick={toggle}>
        {trigger}
      </span>
      {open && (
        <div ref={contentRef} class={styles.popover__content} tabIndex={-1}>
          {children}
        </div>
      )}
    </div>
  )
}
