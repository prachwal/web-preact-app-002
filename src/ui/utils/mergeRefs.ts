import type { Ref } from 'preact'

/** Combines multiple refs (forwarded + internal) into one callback ref. */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): (node: T | null) => void {
  return (node) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === 'function') ref(node)
      else (ref as { current: T | null }).current = node
    }
  }
}
