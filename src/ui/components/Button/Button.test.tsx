import { fireEvent, render, screen } from '@testing-library/preact'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('applies tone and size variant classes', () => {
    render(
      <Button tone="danger" size="lg">
        Delete
      </Button>,
    )
    const el = screen.getByRole('button', { name: 'Delete' })
    expect(el.className).toMatch(/tone-danger/)
    expect(el.className).toMatch(/size-lg/)
  })

  it('blocks onClick and stays out of the tab order when disabled', () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('sets aria-busy and disables the button while loading', () => {
    render(<Button loading>Save</Button>)
    const el = screen.getByRole('button', { name: 'Save' })
    expect(el).toHaveAttribute('aria-busy', 'true')
    expect(el).toBeDisabled()
  })
})
