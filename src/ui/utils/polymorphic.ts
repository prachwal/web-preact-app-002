import { forwardRef } from 'preact/compat'
import type { FunctionComponent, HTMLAttributes, JSX, Ref } from 'preact'

export type ElementTag = keyof JSX.IntrinsicElements

/**
 * Common prop shape every intrinsic HTML element accepts. Used as the
 * render-time type for a dynamic `as` tag — TypeScript can't resolve the
 * full `IntrinsicElements` union for a runtime string, so components that
 * accept `as` render through this narrower, still-typed contract instead
 * of falling back to `any`. Parametrized on the base `Element` (not
 * `HTMLElement`) so its inherited `ref` field matches `polymorphicForwardRef`'s
 * `Ref<Element>` exactly — mixing the two would intersect into an
 * unsatisfiable ref type.
 */
export type PolymorphicElementProps = HTMLAttributes<Element>

/** Casts an intrinsic tag name to a component callable with `PolymorphicElementProps`. */
export function asPolymorphic(tag: ElementTag): FunctionComponent<PolymorphicElementProps> {
  return tag as unknown as FunctionComponent<PolymorphicElementProps>
}

/**
 * Full per-element polymorphic props: the component's own props, `as`, and
 * every attribute the chosen intrinsic element accepts.
 *
 * ponytail: `ref` resolves to the shared `Element` type, not a per-tag one
 * (`HTMLButtonElement` for `as="button"`, etc.) — Preact's `forwardRef`
 * fixes a single ref type per component, so true per-tag ref inference
 * would need per-tag overload signatures. Upgrade only if a consumer
 * actually needs a tag-specific ref (e.g. calling `.focus()` without a
 * cast).
 */
export type PolymorphicProps<E extends ElementTag, P = object> = P & { as?: E } & Omit<
    JSX.IntrinsicElements[E],
    keyof P | 'as' | 'ref'
  >

type PolymorphicComponent<P> = <E extends ElementTag = 'div'>(
  props: PolymorphicProps<E, P> & { ref?: Ref<Element> },
) => JSX.Element

/**
 * Wraps a polymorphic render function in `preact/compat`'s `forwardRef`,
 * then casts the result to a generic call signature. `forwardRef`'s own
 * type fixes one concrete prop type, so it can't express "the props depend
 * on the `as` the caller passes" — this is the one explicit, documented
 * cast that reconciles the two. Every polymorphic component (`Box`,
 * `Stack`, `Text`) uses it in exactly this shape.
 */
export function polymorphicForwardRef<P>(
  render: (props: P & { as?: ElementTag }, ref: Ref<Element>) => JSX.Element,
): PolymorphicComponent<P> {
  return forwardRef<Element, P & { as?: ElementTag }>(render) as unknown as PolymorphicComponent<P>
}
