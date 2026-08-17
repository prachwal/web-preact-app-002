import type { ComponentChildren } from 'preact'

export interface TabsRootProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  className?: string
  children?: ComponentChildren
}

export interface TabsListProps {
  className?: string
  children?: ComponentChildren
}

export interface TabsTriggerProps {
  value: string
  disabled?: boolean
  className?: string
  children?: ComponentChildren
}

export interface TabsPanelProps {
  value: string
  className?: string
  children?: ComponentChildren
}

export interface TabsContextValue {
  value: string
  setValue: (value: string) => void
  registerTrigger: (value: string, el: HTMLButtonElement | null) => void
  focusAdjacent: (current: string, dir: 1 | -1 | 'first' | 'last') => void
}
