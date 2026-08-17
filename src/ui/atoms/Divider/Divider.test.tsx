import { render, screen } from '@testing-library/preact'
import { describe, expect, it } from 'vitest'
import { Divider } from './Divider'

describe('Divider', () => {
  it('has role="separator" and defaults to horizontal', () => {
    render(<Divider />)
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('applies the vertical orientation modifier class', () => {
    render(<Divider orientation="vertical" data-testid="divider" />)
    expect(screen.getByTestId('divider').className).toMatch(/orientation-vertical/)
  })
})
