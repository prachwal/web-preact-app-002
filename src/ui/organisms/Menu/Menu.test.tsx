import { fireEvent, render, screen, waitFor } from '@testing-library/preact'
import { describe, expect, it, vi } from 'vitest'
import { Menu } from './Menu'

function renderMenu(onSelect: (label: string) => void = () => {}) {
  return render(
    <Menu.Root>
      <Menu.Trigger>Actions</Menu.Trigger>
      <Menu.Content>
        <Menu.Item onSelect={() => onSelect('Rename')}>Rename</Menu.Item>
        <Menu.Item onSelect={() => onSelect('Duplicate')}>Duplicate</Menu.Item>
        <Menu.Separator />
        <Menu.Item disabled onSelect={() => onSelect('Delete')}>
          Delete
        </Menu.Item>
      </Menu.Content>
    </Menu.Root>,
  )
}

describe('Menu', () => {
  it('opens on trigger click and highlights the first item', async () => {
    renderMenu()
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())
    expect(screen.getByText('Rename')).toHaveFocus()
  })

  it('typeahead jumps to the matching item', async () => {
    renderMenu()
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'd' })
    expect(screen.getByText('Duplicate')).toHaveFocus()
  })

  it('selecting an item calls onSelect and closes the menu; disabled items are unselectable', async () => {
    const onSelect = vi.fn()
    renderMenu(onSelect)
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Delete'))
    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Rename'))
    expect(onSelect).toHaveBeenCalledWith('Rename')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  })

  it('closes on outside click', async () => {
    render(
      <div>
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Content>
            <Menu.Item>Rename</Menu.Item>
          </Menu.Content>
        </Menu.Root>
        <button>outside</button>
      </div>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())

    fireEvent.mouseDown(screen.getByText('outside'))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('asChild clones onto the child instead of wrapping it in a second <button>', async () => {
    render(
      <Menu.Root>
        <Menu.Trigger asChild>
          <button type="button">Custom trigger</button>
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Item>Rename</Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    )
    const trigger = screen.getByRole('button', { name: 'Custom trigger' })
    expect(trigger.querySelector('button')).toBeNull()
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')

    fireEvent.click(trigger)
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())
  })
})
