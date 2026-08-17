import { fireEvent, render, screen } from '@testing-library/preact'
import { describe, expect, it, vi } from 'vitest'
import { Switch } from './Switch'

describe('Switch', () => {
  it('toggles on click, uncontrolled', () => {
    render(<Switch aria-label="notifications" />)
    const el = screen.getByRole('switch', { name: 'notifications' })
    expect(el).toHaveAttribute('aria-checked', 'false')
    fireEvent.click(el)
    expect(el).toHaveAttribute('aria-checked', 'true')
  })

  it('stays controlled when checked is provided', () => {
    const onCheckedChange = vi.fn()
    render(<Switch checked={false} onCheckedChange={onCheckedChange} aria-label="notifications" />)
    const el = screen.getByRole('switch', { name: 'notifications' })
    fireEvent.click(el)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(el).toHaveAttribute('aria-checked', 'false')
  })
})
