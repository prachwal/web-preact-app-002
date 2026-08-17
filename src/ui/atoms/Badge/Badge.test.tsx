import { render, screen } from '@testing-library/preact'
import { describe, expect, it } from 'vitest'
import { Badge } from './Badge'

describe('Badge', () => {
  it('applies the tone variant class', () => {
    render(<Badge tone="success">Active</Badge>)
    expect(screen.getByText('Active').closest('span')?.className).toMatch(/tone-success/)
  })

  it('hides the decorative dot from the accessibility tree', () => {
    render(<Badge>New</Badge>)
    const dot = document.querySelector('[aria-hidden="true"]')
    expect(dot).toBeInTheDocument()
  })
})
