/** Mirrors the `@media (prefers-reduced-motion: reduce)` check the token
 * layer already applies to CSS durations — for the JS-driven half (WAAPI). */
export function prefersReducedMotion(): boolean {
  // jsdom (the test environment) doesn't implement matchMedia — treat that
  // as "no preference" rather than throwing.
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Runs a Web Animations API animation unless the user prefers reduced
 * motion, in which case it resolves immediately — no animation library,
 * used by Toast's exit transition so its auto-dismiss timing doesn't wait
 * on an animation the user asked not to see.
 */
export function animateIfAllowed(
  el: Element,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  options: KeyframeAnimationOptions,
): Promise<void> {
  if (prefersReducedMotion() || typeof el.animate !== 'function') return Promise.resolve()
  return el
    .animate(keyframes, options)
    .finished.then(() => undefined)
    .catch(() => undefined)
}
