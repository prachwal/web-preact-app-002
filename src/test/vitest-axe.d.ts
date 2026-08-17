// vitest-axe ships matcher types but doesn't augment vitest's own
// `Assertion` interface (unlike @testing-library/jest-dom/vitest, which
// does) — do it by hand so `expect(await axe(...)).toHaveNoViolations()`
// type-checks.
import type { AxeMatchers } from 'vitest-axe/matchers'

declare module 'vitest' {
  interface Assertion<T = unknown> extends AxeMatchers {}
}
