import { useEffect, useRef, useState } from 'preact/hooks'
import { animateIfAllowed } from '@ui/utils/motion'
import { cx } from '@ui/utils/cx'
import { toast, toastStore } from './Toast.store'
import styles from './Toast.module.scss'
import type { ToastItem, ToastViewportProps } from './Toast.types'

function ToastCard({ item, dismissLabel }: { item: ToastItem; dismissLabel: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'open' | 'closed'>('open')

  const close = () => {
    setState('closed')
    const el = ref.current
    const finish = () => toast.dismiss(item.id)
    if (el) animateIfAllowed(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 150, easing: 'ease' }).then(finish)
    else finish()
  }

  // mount-only timer: item.duration/id never change for a given toast, and
  // `close` reads `item`/`ref` fresh via closure each render regardless
  useEffect(() => {
    if (item.duration <= 0) return
    const timer = window.setTimeout(close, item.duration)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div
      ref={ref}
      role={item.type === 'danger' ? 'alert' : 'status'}
      aria-live={item.type === 'danger' ? 'assertive' : 'polite'}
      data-state={state}
      data-type={item.type}
      class={styles.toast}
    >
      <p class={styles.toast__title}>{item.title}</p>
      {item.description && <p class={styles.toast__description}>{item.description}</p>}
      <button type="button" class={styles.toast__close} aria-label={dismissLabel} onClick={close}>
        ×
      </button>
    </div>
  )
}

/** Mount once near the app root; `toast.show(...)` (from `./Toast.store`) can be called from anywhere afterward. */
export function ToastViewport({ className, dismissLabel = 'Dismiss' }: ToastViewportProps) {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => toastStore.subscribe(setItems), [])

  return (
    <div class={cx(styles['toast-viewport'], className)}>
      {items.map((item) => (
        <ToastCard key={item.id} item={item} dismissLabel={dismissLabel} />
      ))}
    </div>
  )
}

export { toast }
