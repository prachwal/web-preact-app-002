import { render, screen } from '@testing-library/preact'
import { describe, expect, it } from 'vitest'
import { App } from './app'

describe('App', () => {
  it('renders the hero headline and CTA', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { level: 1, name: /ship products/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /start free trial/i }),
    ).toBeInTheDocument()
  })

  it('renders all trust stats', () => {
    const { container } = render(<App />)

    expect(container.querySelectorAll('.trust__stat')).toHaveLength(4)
    expect(screen.getByText('99.99%')).toBeInTheDocument()
  })
})
