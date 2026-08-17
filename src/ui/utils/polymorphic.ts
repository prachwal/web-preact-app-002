import type { FunctionComponent, HTMLAttributes, JSX, Ref } from 'preact'

export type ElementTag = keyof JSX.IntrinsicElements

/**
 * Common prop shape every intrinsic HTML element accepts. Used as the
 * render-time type for a dynamic `as` tag — TypeScript can't resolve the
 * full `IntrinsicElements` union for a runtime string, so components that
 * accept `as` render through this narrower, still-typed contract instead
 * of falling back to `any`.
 */
export type PolymorphicElementProps = HTMLAttributes<HTMLElement> & {
  ref?: Ref<HTMLElement>
}

/** Casts an intrinsic tag name to a component callable with `PolymorphicElementProps`. */
export function asPolymorphic(tag: ElementTag): FunctionComponent<PolymorphicElementProps> {
  return tag as unknown as FunctionComponent<PolymorphicElementProps>
}
