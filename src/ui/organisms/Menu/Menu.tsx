import { cloneElement, createContext, isValidElement } from 'preact'
import type { JSX, VNode } from 'preact'
import { useContext, useEffect, useRef } from 'preact/hooks'
import { cx } from '@ui/utils/cx'
import { useDisclosure } from '@ui/utils/useDisclosure'
import styles from './Menu.module.scss'
import type {
  MenuContentProps,
  MenuContextValue,
  MenuItemProps,
  MenuRootProps,
  MenuTriggerProps,
} from './Menu.types'

const MenuContext = createContext<MenuContextValue | null>(null)

function useMenuContext(): MenuContextValue {
  const ctx = useContext(MenuContext)
  if (!ctx) throw new Error('Menu.Trigger/Content/Item must be rendered inside Menu.Root')
  return ctx
}

const ITEM_SELECTOR = '[role="menuitem"]:not([aria-disabled="true"])'

function focusableItems(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(ITEM_SELECTOR))
}

function moveHighlight(container: HTMLElement, dir: 1 | -1 | 'first' | 'last') {
  const items = focusableItems(container)
  if (items.length === 0) return
  let next: number
  if (dir === 'first') next = 0
  else if (dir === 'last') next = items.length - 1
  else {
    const current = items.findIndex((el) => el === document.activeElement)
    next = current === -1 ? 0 : (current + dir + items.length) % items.length
  }
  for (const el of items) el.removeAttribute('data-highlighted')
  items[next].setAttribute('data-highlighted', 'true')
  items[next].focus()
}

interface TypeaheadState {
  buffer: string
  timer: ReturnType<typeof setTimeout> | undefined
}

function handleTypeahead(state: TypeaheadState, container: HTMLElement, char: string) {
  window.clearTimeout(state.timer)
  state.buffer += char.toLowerCase()
  state.timer = setTimeout(() => {
    state.buffer = ''
  }, 500)

  const items = focusableItems(container)
  const match = items.find((el) => el.textContent?.trim().toLowerCase().startsWith(state.buffer))
  if (match) {
    for (const el of items) el.removeAttribute('data-highlighted')
    match.setAttribute('data-highlighted', 'true')
    match.focus()
  }
}

function Root({ open, defaultOpen, onOpenChange, className, children }: MenuRootProps) {
  const { open: isOpen, toggle, hide } = useDisclosure({ open, defaultOpen, onOpenChange })
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) hide()
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [isOpen, hide])

  return (
    <div ref={rootRef} class={cx(styles.menu, className)}>
      <MenuContext.Provider value={{ open: isOpen, toggle, close: hide }}>{children}</MenuContext.Provider>
    </div>
  )
}

function Trigger({ asChild, className, children }: MenuTriggerProps) {
  const { open, toggle } = useMenuContext()

  if (asChild && isValidElement(children)) {
    const child = children as VNode<{ onClick?: JSX.MouseEventHandler<Element> }>
    return cloneElement(child, {
      onClick: (event: JSX.TargetedMouseEvent<Element>) => {
        child.props.onClick?.(event)
        toggle()
      },
      'aria-haspopup': 'menu',
      'aria-expanded': open,
    })
  }

  return (
    <button
      type="button"
      class={cx(styles.menu__trigger, className)}
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={toggle}
    >
      {children}
    </button>
  )
}

function Content({ className, children }: MenuContentProps) {
  const { open, close } = useMenuContext()
  const contentRef = useRef<HTMLDivElement>(null)
  const typeahead = useRef<TypeaheadState>({ buffer: '', timer: undefined })

  useEffect(() => {
    if (open && contentRef.current) moveHighlight(contentRef.current, 'first')
  }, [open])

  if (!open) return null

  return (
    <div
      ref={contentRef}
      role="menu"
      data-state="open"
      class={cx(styles.menu__content, className)}
      onKeyDown={(event) => {
        const container = contentRef.current
        if (!container) return
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          moveHighlight(container, 1)
        } else if (event.key === 'ArrowUp') {
          event.preventDefault()
          moveHighlight(container, -1)
        } else if (event.key === 'Home') {
          event.preventDefault()
          moveHighlight(container, 'first')
        } else if (event.key === 'End') {
          event.preventDefault()
          moveHighlight(container, 'last')
        } else if (event.key === 'Escape') {
          close()
        } else if (event.key.length === 1) {
          handleTypeahead(typeahead.current, container, event.key)
        }
      }}
    >
      {children}
    </div>
  )
}

function Item({ disabled, onSelect, className, children }: MenuItemProps) {
  const { close } = useMenuContext()
  return (
    <div
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      class={cx(styles.menu__item, className)}
      onClick={() => {
        if (disabled) return
        onSelect?.()
        close()
      }}
    >
      {children}
    </div>
  )
}

function Separator() {
  return <div role="separator" class={styles.menu__separator} />
}

export const Menu = { Root, Trigger, Content, Item, Separator }
