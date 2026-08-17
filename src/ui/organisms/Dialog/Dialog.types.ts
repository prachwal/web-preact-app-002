import type { ComponentChildren } from 'preact'

export interface DialogRootProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: ComponentChildren
}

export interface DialogTriggerProps {
  /** clone the click handler onto the single child instead of wrapping it in a `<button>` — use when the child (e.g. `<Button>`) is already interactive, so triggers never nest `<button>` inside `<button>` */
  asChild?: boolean
  className?: string
  children?: ComponentChildren
}

export interface DialogContentProps {
  className?: string
  children?: ComponentChildren
}

export interface DialogTitleProps {
  className?: string
  children?: ComponentChildren
}

export interface DialogCloseProps {
  className?: string
  /** defaults to an 'aria-label="Close"' × symbol — pass children/aria-label to localize */
  children?: ComponentChildren
}

export interface DialogContextValue {
  open: boolean
  show: () => void
  hide: () => void
  titleId: string
}
