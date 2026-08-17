import type { ComponentChildren } from 'preact'

export type TooltipPlacement = 'top' | 'bottom'

export interface TooltipOwnProps {
  content: ComponentChildren
  delay?: number
  placement?: TooltipPlacement
  className?: string
  /** the trigger — a single focusable/hoverable element */
  children: ComponentChildren
}

export type TooltipProps = TooltipOwnProps
