import { fireEvent, render, screen } from '@testing-library/preact'
import { describe, expect, it, vi } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  it('runs uncontrolled with defaultValue', () => {
    render(<Input defaultValue="hi" aria-label="name" />)
    const el = screen.getByLabelText('name') as HTMLInputElement
    fireEvent.input(el, { target: { value: 'hello' } })
    expect(el.value).toBe('hello')
  })

  it('stays controlled when value is provided', () => {
    const onValueChange = vi.fn()
    render(<Input value="fixed" onValueChange={onValueChange} aria-label="name" />)
    const el = screen.getByLabelText('name') as HTMLInputElement
    fireEvent.input(el, { target: { value: 'typed' } })
    expect(onValueChange).toHaveBeenCalledWith('typed')
    expect(el.value).toBe('fixed')
  })

  it('sets aria-invalid when invalid', () => {
    render(<Input invalid aria-label="name" />)
    expect(screen.getByLabelText('name')).toHaveAttribute('aria-invalid', 'true')
  })
})
