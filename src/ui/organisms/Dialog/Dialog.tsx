import { cloneElement, createContext, isValidElement } from 'preact'
import { createPortal } from 'preact/compat'
import type { JSX, VNode } from 'preact'
import { useContext, useEffect, useId, useRef } from 'preact/hooks'
import { cx } from '@ui/utils/cx'
import { useDisclosure } from '@ui/utils/useDisclosure'
import { useFocusTrap } from '@ui/utils/useFocusTrap'
import styles from './Dialog.module.scss'
import type {
  DialogCloseProps,
  DialogContentProps,
  DialogContextValue,
  DialogRootProps,
  DialogTitleProps,
  DialogTriggerProps,
} from './Dialog.types'

const DialogContext = createContext<DialogContextValue | null>(null)

function useDialogContext(): DialogContextValue {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error('Dialog.Trigger/Content/Title/Close must be rendered inside Dialog.Root')
  return ctx
}

function Root({ open, defaultOpen, onOpenChange, children }: DialogRootProps) {
  const { open: isOpen, show, hide } = useDisclosure({ open, defaultOpen, onOpenChange })
  const titleId = useId()

  return <DialogContext.Provider value={{ open: isOpen, show, hide, titleId }}>{children}</DialogContext.Provider>
}

function Trigger({ asChild, className, children }: DialogTriggerProps) {
  const { show } = useDialogContext()

  if (asChild && isValidElement(children)) {
    const child = children as VNode<{ onClick?: JSX.MouseEventHandler<Element> }>
    return cloneElement(child, {
      onClick: (event: JSX.TargetedMouseEvent<Element>) => {
        child.props.onClick?.(event)
        show()
      },
    })
  }

  return (
    <button type="button" class={className} onClick={show}>
      {children}
    </button>
  )
}

function Content({ className, children }: DialogContentProps) {
  const { open, hide, titleId } = useDialogContext()
  const contentRef = useRef<HTMLDivElement>(null)
  useFocusTrap(contentRef, open)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hide()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, hide])

  if (!open) return null

  return createPortal(
    <div class={styles.dialog__overlay} data-state="open" onClick={hide}>
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        class={cx(styles.dialog__content, className)}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}

function Title({ className, children }: DialogTitleProps) {
  const { titleId } = useDialogContext()
  return (
    <h2 id={titleId} class={cx(styles.dialog__title, className)}>
      {children}
    </h2>
  )
}

function Close({ className, children }: DialogCloseProps) {
  const { hide } = useDialogContext()
  return (
    <button
      type="button"
      class={cx(styles.dialog__close, className)}
      onClick={hide}
      aria-label={children ? undefined : 'Close'}
    >
      {children ?? '×'}
    </button>
  )
}

export const Dialog = { Root, Trigger, Content, Title, Close }
