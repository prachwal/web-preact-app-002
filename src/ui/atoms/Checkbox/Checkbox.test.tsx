import { fireEvent, render, screen } from '@testing-library/preact'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('toggles uncontrolled state on click', () => {
    render(<Checkbox aria-label="agree" />)
    const el = screen.getByRole('checkbox', { name: 'agree' }) as HTMLInputElement
    expect(el.checked).toBe(false)
    fireEvent.click(el)
    expect(el.checked).toBe(true)
  })

  it('stays controlled when checked is provided', () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox checked={false} onCheckedChange={onCheckedChange} aria-label="agree" />)
    const el = screen.getByRole('checkbox', { name: 'agree' }) as HTMLInputElement
    fireEvent.click(el)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(el.checked).toBe(false)
  })

  it('sets aria-checked="mixed" when indeterminate', () => {
    render(<Checkbox indeterminate aria-label="agree" />)
    expect(screen.getByRole('checkbox', { name: 'agree' })).toHaveAttribute('aria-checked', 'mixed')
  })
})
