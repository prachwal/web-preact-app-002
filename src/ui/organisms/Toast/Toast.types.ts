import type { ComponentChildren } from 'preact'

export type ToastType = 'info' | 'success' | 'warning' | 'danger'

export interface ToastItem {
  id: string
  title: ComponentChildren
  description?: ComponentChildren
  type: ToastType
  /** ms before auto-dismiss; 0 disables it */
  duration: number
}

export interface ToastInput {
  title: ComponentChildren
  description?: ComponentChildren
  type?: ToastType
  duration?: number
}

export interface ToastViewportProps {
  className?: string
  /** localizes the per-toast dismiss button; defaults to 'Dismiss' */
  dismissLabel?: string
}
