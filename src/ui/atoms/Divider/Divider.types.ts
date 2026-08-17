import type { HTMLAttributes } from 'preact'

export type DividerOrientation = 'horizontal' | 'vertical'

export interface DividerOwnProps {
  orientation?: DividerOrientation
  className?: string
}

export type DividerProps = DividerOwnProps &
  Omit<HTMLAttributes<HTMLHRElement>, keyof DividerOwnProps>
