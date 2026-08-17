import { useEffect, useId, useRef, useState } from 'preact/hooks'
import { cx } from '@ui/utils/cx'
import { useControllableState } from '@ui/utils/useControllableState'
import styles from './Combobox.module.scss'
import type { ComboboxOption, ComboboxProps } from './Combobox.types'

const defaultFilter = (option: ComboboxOption, query: string) =>
  option.label.toLowerCase().includes(query.toLowerCase())

export function Combobox({
  value,
  onValueChange,
  inputValue,
  onInputChange,
  options,
  filter = defaultFilter,
  className,
  onFocus,
  ...rest
}: ComboboxProps) {
  const [selected, setSelected] = useControllableState({ value, defaultValue: '', onChange: onValueChange })
  const [text, setText] = useControllableState({
    value: inputValue,
    defaultValue: '',
    onChange: onInputChange,
  })
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const id = useId()
  const listId = `${id}-list`
  const rootRef = useRef<HTMLDivElement>(null)

  const filtered = text ? options.filter((option) => filter(option, text)) : options

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  const selectOption = (option: ComboboxOption) => {
    setSelected(option.value)
    setText(option.label)
    setOpen(false)
  }

  const activeOption = open ? filtered[highlighted] : undefined

  return (
    <div ref={rootRef} class={cx(styles.combobox, className)} data-state={open ? 'open' : 'closed'}>
      <input
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeOption ? `${id}-option-${activeOption.value}` : undefined}
        class={styles.combobox__input}
        value={text}
        onInput={(event) => {
          setText((event.target as HTMLInputElement).value)
          setOpen(true)
          setHighlighted(0)
        }}
        onFocus={(event) => {
          setOpen(true)
          onFocus?.(event)
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setOpen(true)
            setHighlighted((i) => Math.min(i + 1, filtered.length - 1))
          } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            setHighlighted((i) => Math.max(i - 1, 0))
          } else if (event.key === 'Enter') {
            if (open && filtered[highlighted]) {
              event.preventDefault()
              selectOption(filtered[highlighted])
            }
          } else if (event.key === 'Escape') {
            setOpen(false)
          }
        }}
        {...rest}
      />
      {open && filtered.length > 0 && (
        <ul role="listbox" id={listId} class={styles.combobox__list}>
          {filtered.map((option, index) => (
            <li
              key={option.value}
              role="option"
              id={`${id}-option-${option.value}`}
              aria-selected={option.value === selected}
              data-selected={option.value === selected || undefined}
              data-highlighted={index === highlighted || undefined}
              class={styles.combobox__option}
              // mousedown (not click) fires before the input's blur, so the
              // list doesn't unmount before the selection is registered
              onMouseDown={(event) => {
                event.preventDefault()
                selectOption(option)
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
