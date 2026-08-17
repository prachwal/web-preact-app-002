import { useCallback, useState } from 'preact/hooks'

interface UseControllableStateProps<T> {
  value?: T
  defaultValue: T
  onChange?: (value: T) => void
}

/**
 * Standard controlled/uncontrolled pattern: value wins when provided,
 * defaultValue seeds local state otherwise. Also returns `isControlled` —
 * native form elements mutate their own DOM property on user interaction
 * regardless of props, so a controlled caller that doesn't change `value`
 * needs its component to synchronously revert that native mutation inside
 * the event handler itself (no re-render will happen to catch it later).
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateProps<T>): [T, (next: T) => void, boolean] {
  const [uncontrolled, setUncontrolled] = useState(defaultValue)
  const isControlled = value !== undefined
  const current = isControlled ? (value as T) : uncontrolled

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolled(next)
      onChange?.(next)
    },
    [isControlled, onChange],
  )

  return [current, setValue, isControlled]
}
