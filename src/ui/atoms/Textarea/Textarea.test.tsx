import { fireEvent, render, screen } from '@testing-library/preact'
import { describe, expect, it } from 'vitest'
import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('runs uncontrolled with defaultValue', () => {
    render(<Textarea defaultValue="hi" aria-label="bio" />)
    const el = screen.getByLabelText('bio') as HTMLTextAreaElement
    fireEvent.input(el, { target: { value: 'hello world' } })
    expect(el.value).toBe('hello world')
  })

  it('forwards rows', () => {
    render(<Textarea rows={8} aria-label="bio" />)
    expect(screen.getByLabelText('bio')).toHaveAttribute('rows', '8')
  })
})
