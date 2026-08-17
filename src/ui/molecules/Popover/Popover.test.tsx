import { fireEvent, render, screen, waitFor } from '@testing-library/preact'
import { describe, expect, it } from 'vitest'
import { Popover } from './Popover'

describe('Popover', () => {
  it('opens on trigger click and moves focus into the content (focus trap engages)', async () => {
    render(
      <Popover trigger={<button>open</button>}>
        <button>first</button>
        <button>second</button>
      </Popover>,
    )

    fireEvent.click(screen.getByText('open'))
    await waitFor(() => expect(screen.getByText('first')).toBeInTheDocument())
    expect(screen.getByText('first')).toHaveFocus()
  })

  it('closes on outside click', async () => {
    render(
      <div>
        <Popover trigger={<button>open</button>}>
          <button>first</button>
        </Popover>
        <button>outside</button>
      </div>,
    )

    fireEvent.click(screen.getByText('open'))
    await waitFor(() => expect(screen.getByText('first')).toBeInTheDocument())

    fireEvent.mouseDown(screen.getByText('outside'))
    expect(screen.queryByText('first')).not.toBeInTheDocument()
  })

  it('supports controlled open state', () => {
    const { rerender } = render(
      <Popover trigger={<button>open</button>} open={false}>
        <button>first</button>
      </Popover>,
    )
    expect(screen.queryByText('first')).not.toBeInTheDocument()

    rerender(
      <Popover trigger={<button>open</button>} open={true}>
        <button>first</button>
      </Popover>,
    )
    expect(screen.getByText('first')).toBeInTheDocument()
  })
})
