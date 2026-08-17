import { render, screen } from '@testing-library/preact'
import { describe, expect, it } from 'vitest'
import { Input } from '@ui/atoms/Input'
import { Field } from './Field'

describe('Field', () => {
  it('links the label to the control via htmlFor', () => {
    render(
      <Field label="Email">
        <Input />
      </Field>,
    )
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('links the error text via aria-describedby and sets aria-invalid', () => {
    render(
      <Field label="Email" error="Required">
        <Input />
      </Field>,
    )
    const control = screen.getByLabelText('Email')
    const error = screen.getByRole('alert')
    expect(control).toHaveAttribute('aria-invalid', 'true')
    expect(control.getAttribute('aria-describedby')).toBe(error.id)
  })

  it('does not set data-invalid when there is no error', () => {
    render(
      <Field label="Email">
        <Input />
      </Field>,
    )
    // regression: `data-invalid={false}` still renders the attribute, which
    // matches the presence-based `[data-invalid]` CSS selector
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('data-invalid')
  })
})
