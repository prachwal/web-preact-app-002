import { fireEvent, render, screen, waitFor } from '@testing-library/preact'
import { describe, expect, it } from 'vitest'
import { Dialog } from './Dialog'

function renderDialog() {
  return render(
    <Dialog.Root>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Delete item</Dialog.Title>
        <Dialog.Close>Close</Dialog.Close>
        <button>Confirm</button>
      </Dialog.Content>
    </Dialog.Root>,
  )
}

describe('Dialog', () => {
  it('opens with aria-modal and traps focus inside, restoring it on close', async () => {
    renderDialog()
    const trigger = screen.getByRole('button', { name: 'Open' })
    trigger.focus()

    fireEvent.click(trigger)
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    expect(document.activeElement).not.toBe(trigger)
    expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement)

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it('closes on overlay click but not on content click', async () => {
    renderDialog()
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('dialog').parentElement!)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('asChild clones onto the child instead of wrapping it in a second <button>', async () => {
    render(
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <button type="button">Custom trigger</button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Delete item</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>,
    )
    const trigger = screen.getByRole('button', { name: 'Custom trigger' })
    expect(trigger.tagName).toBe('BUTTON')
    expect(trigger.querySelector('button')).toBeNull()

    fireEvent.click(trigger)
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
  })
})
