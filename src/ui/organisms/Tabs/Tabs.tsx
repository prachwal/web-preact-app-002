import { createContext } from 'preact'
import { useCallback, useContext, useEffect, useRef } from 'preact/hooks'
import { cx } from '@ui/utils/cx'
import { useControllableState } from '@ui/utils/useControllableState'
import styles from './Tabs.module.scss'
import type {
  TabsContextValue,
  TabsListProps,
  TabsPanelProps,
  TabsRootProps,
  TabsTriggerProps,
} from './Tabs.types'

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext(): TabsContextValue {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs.List/Trigger/Panel must be rendered inside Tabs.Root')
  return ctx
}

function Root({ value, defaultValue, onValueChange, className, children }: TabsRootProps) {
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  })
  const triggers = useRef(new Map<string, HTMLButtonElement>())

  const registerTrigger = useCallback((v: string, el: HTMLButtonElement | null) => {
    if (el) triggers.current.set(v, el)
    else triggers.current.delete(v)
  }, [])

  const focusAdjacent = useCallback(
    (cur: string, dir: 1 | -1 | 'first' | 'last') => {
      const keys = Array.from(triggers.current.keys())
      if (keys.length === 0) return
      let nextKey: string
      if (dir === 'first') nextKey = keys[0]
      else if (dir === 'last') nextKey = keys[keys.length - 1]
      else {
        const idx = keys.indexOf(cur)
        nextKey = keys[(idx + dir + keys.length) % keys.length]
      }
      setCurrent(nextKey)
      triggers.current.get(nextKey)?.focus()
    },
    [setCurrent],
  )

  return (
    <TabsContext.Provider value={{ value: current, setValue: setCurrent, registerTrigger, focusAdjacent }}>
      <div class={cx(styles.tabs, className)}>{children}</div>
    </TabsContext.Provider>
  )
}

function List({ className, children }: TabsListProps) {
  return (
    <div role="tablist" class={cx(styles.tabs__list, className)}>
      {children}
    </div>
  )
}

function Trigger({ value, disabled, className, children }: TabsTriggerProps) {
  const { value: active, setValue, registerTrigger, focusAdjacent } = useTabsContext()
  const ref = useRef<HTMLButtonElement>(null)
  const isActive = active === value

  useEffect(() => {
    registerTrigger(value, ref.current)
    return () => registerTrigger(value, null)
  }, [value, registerTrigger])

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={`tabs-trigger-${value}`}
      aria-selected={isActive}
      aria-controls={`tabs-panel-${value}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      data-state={isActive ? 'active' : 'inactive'}
      class={cx(styles.tabs__trigger, className)}
      onClick={() => setValue(value)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          focusAdjacent(value, 1)
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault()
          focusAdjacent(value, -1)
        } else if (event.key === 'Home') {
          event.preventDefault()
          focusAdjacent(value, 'first')
        } else if (event.key === 'End') {
          event.preventDefault()
          focusAdjacent(value, 'last')
        }
      }}
    >
      {children}
      {isActive && <span class={styles.tabs__indicator} aria-hidden="true" />}
    </button>
  )
}

function Panel({ value, className, children }: TabsPanelProps) {
  const { value: active } = useTabsContext()
  if (active !== value) return null

  return (
    <div
      role="tabpanel"
      id={`tabs-panel-${value}`}
      aria-labelledby={`tabs-trigger-${value}`}
      tabIndex={0}
      data-state="active"
      class={cx(styles.tabs__panel, className)}
    >
      {children}
    </div>
  )
}

export const Tabs = { Root, List, Trigger, Panel }
