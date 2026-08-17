import { fireEvent, render, screen } from '@testing-library/preact'
import { describe, expect, it, vi } from 'vitest'
import { Combobox } from './Combobox'

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot' },
  { value: 'banana', label: 'Banana' },
]

describe('Combobox', () => {
  it('narrows the option list as the query filters', () => {
    render(<Combobox options={options} aria-label="fruit" />)
    const input = screen.getByRole('combobox', { name: 'fruit' })
    fireEvent.focus(input)
    fireEvent.input(input, { target: { value: 'ap' } })

    expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Apricot' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Banana' })).not.toBeInTheDocument()
  })

  it('moves aria-activedescendant with the arrow keys', () => {
    render(<Combobox options={options} aria-label="fruit" />)
    const input = screen.getByRole('combobox', { name: 'fruit' })
    fireEvent.focus(input)

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Apricot' }).id)
  })

  it('selects the highlighted option on Enter', () => {
    const onValueChange = vi.fn()
    render(<Combobox options={options} onValueChange={onValueChange} aria-label="fruit" />)
    const input = screen.getByRole('combobox', { name: 'fruit' })
    fireEvent.focus(input)

    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onValueChange).toHaveBeenCalledWith('apple')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
