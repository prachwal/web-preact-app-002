import type { TextareaHTMLAttributes } from 'preact'

export interface TextareaOwnProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  invalid?: boolean
  className?: string
}

export type TextareaProps = TextareaOwnProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, keyof TextareaOwnProps>
