import { fireEvent, render, screen, waitFor } from '@testing-library/preact'
import { describe, expect, it } from 'vitest'
import { Tooltip } from './Tooltip'

// ponytail: RTL's fireEvent.focusIn/mouseEnter constructs a FocusEvent/
// MouseEvent that, in this jsdom version, doesn't actually bubble past the
// dispatch target — a manual dispatchEvent with the same init does. Same
// class of quirk as Select.test.tsx's fireEvent.change workaround; no bug
// in Tooltip itself (verified bubbling is otherwise fine, e.g. for click).
function focusInto(el: Element) {
  el.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
}

describe('Tooltip', () => {
  it('opens on focus after the delay and sets aria-describedby', async () => {
    render(
      <Tooltip content="Helpful hint" delay={0}>
        <button>trigger</button>
      </Tooltip>,
    )

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    focusInto(screen.getByText('trigger'))
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument())

    const trigger = screen.getByText('trigger').parentElement!
    expect(trigger).toHaveAttribute('aria-describedby', screen.getByRole('tooltip').id)
  })

  it('closes on Escape', async () => {
    render(
      <Tooltip content="Helpful hint" delay={0}>
        <button>trigger</button>
      </Tooltip>,
    )

    focusInto(screen.getByText('trigger'))
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument())

    fireEvent.keyDown(screen.getByText('trigger'), { key: 'Escape' })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
