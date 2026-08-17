import type { ComponentChildren } from 'preact'

export interface PopoverOwnProps {
  /** the trigger — a single clickable element */
  trigger: ComponentChildren
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  children?: ComponentChildren
}

export type PopoverProps = PopoverOwnProps
