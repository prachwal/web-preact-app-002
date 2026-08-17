import { render } from '@testing-library/preact'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Playground } from './Playground'

// Smoke check, not exhaustive: exercises every mounted component's default
// (closed) state in one pass rather than adding a per-component axe
// assertion to all 20+ existing test files. Open states (an expanded Menu,
// a shown Dialog, …) aren't covered here — their own component tests assert
// the specific ARIA attributes (aria-modal, aria-expanded, …) that matter
// for those states instead.
describe('Playground a11y', () => {
  it('has no detectable accessibility violations in its default state', async () => {
    render(<Playground />)
    expect(await axe(document.body)).toHaveNoViolations()
  })
})
