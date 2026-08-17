import type { ComponentChildren, VNode } from 'preact'

/** The subset of props Field injects into whatever control it wraps. */
export interface FieldControlProps {
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  'data-invalid'?: boolean
}

export interface FieldOwnProps {
  label: ComponentChildren
  hint?: ComponentChildren
  error?: ComponentChildren
  required?: boolean
  className?: string
  /** a single control element (Input, Textarea, Select, …) that accepts FieldControlProps */
  children: VNode<FieldControlProps>
}

export type FieldProps = FieldOwnProps
