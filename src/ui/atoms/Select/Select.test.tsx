import { fireEvent, render, screen } from '@testing-library/preact'
import { describe, expect, it, vi } from 'vitest'
import { Select } from './Select'

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
]

// ponytail: RTL's fireEvent.change uses setNativeValue()'s prototype-setter
// call, which — only once preact/compat is loaded anywhere in the module
// graph (always true here) — silently fails to reach the select's change
// listener in this jsdom version. A plain manual dispatch sidesteps it and
// still exercises the real component code; no bug in Select itself.
function changeSelectValue(select: HTMLSelectElement, value: string) {
  select.value = value
  fireEvent(select, new Event('change', { bubbles: true }))
}

describe('Select', () => {
  it('renders the option list', () => {
    render(<Select options={options} aria-label="choice" />)
    expect(screen.getByRole('option', { name: 'Option A' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Option B' })).toBeInTheDocument()
  })

  it('fires onValueChange on change', () => {
    const onValueChange = vi.fn()
    render(<Select options={options} onValueChange={onValueChange} aria-label="choice" />)
    changeSelectValue(screen.getByRole('combobox', { name: 'choice' }) as HTMLSelectElement, 'b')
    expect(onValueChange).toHaveBeenCalledWith('b')
  })
})
