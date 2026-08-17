import type { ToastInput, ToastItem } from './Toast.types'

// Module-level store, not React state — `toast.show()` is meant to be
// called from anywhere (an event handler, a fetch `.catch()`, outside any
// component tree), the way an imperative toast API always works. Any
// mounted <ToastViewport> subscribes and re-renders when it changes.
type Listener = (items: ToastItem[]) => void

let items: ToastItem[] = []
const listeners = new Set<Listener>()

function emit() {
  for (const listener of listeners) listener(items)
}

function show(input: ToastInput): string {
  const id = Math.random().toString(36).slice(2)
  items = [...items, { id, title: input.title, description: input.description, type: input.type ?? 'info', duration: input.duration ?? 4000 }]
  emit()
  return id
}

function dismiss(id: string): void {
  items = items.filter((item) => item.id !== id)
  emit()
}

function clear(): void {
  items = []
  emit()
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  listener(items)
  return () => listeners.delete(listener)
}

export const toast = { show, dismiss, clear }
export const toastStore = { subscribe }
