import { render, screen } from '@testing-library/preact'
import { describe, expect, it } from 'vitest'
import { Box } from './Box'

describe('Box', () => {
  it('renders as a div by default', () => {
    render(<Box data-testid="box">hi</Box>)
    expect(screen.getByTestId('box').tagName).toBe('DIV')
  })

  it('renders as the given element', () => {
    render(
      <Box as="section" data-testid="box">
        hi
      </Box>,
    )
    expect(screen.getByTestId('box').tagName).toBe('SECTION')
  })

  it('forwards className and style', () => {
    render(
      <Box data-testid="box" className="extra" style={{ color: 'red' }}>
        hi
      </Box>,
    )
    const el = screen.getByTestId('box')
    expect(el).toHaveClass('extra')
    expect(el).toHaveStyle({ color: 'rgb(255, 0, 0)' })
  })
})
