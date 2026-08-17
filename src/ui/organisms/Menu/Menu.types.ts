import type { ComponentChildren } from 'preact'

export interface MenuRootProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  children?: ComponentChildren
}

export interface MenuTriggerProps {
  /** clone onto the single child instead of wrapping it in a `<button>` — use when the child (e.g. `<Button>`) is already interactive */
  asChild?: boolean
  className?: string
  children?: ComponentChildren
}

export interface MenuContentProps {
  className?: string
  children?: ComponentChildren
}

export interface MenuItemProps {
  disabled?: boolean
  onSelect?: () => void
  className?: string
  children?: ComponentChildren
}

export interface MenuContextValue {
  open: boolean
  toggle: () => void
  close: () => void
}
