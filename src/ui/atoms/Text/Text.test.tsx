import { render, screen } from '@testing-library/preact'
import { describe, expect, it } from 'vitest'
import { Text } from './Text'

describe('Text', () => {
  it('renders a span by default', () => {
    render(<Text data-testid="text">hi</Text>)
    expect(screen.getByTestId('text').tagName).toBe('SPAN')
  })

  it('applies size and tone variant classes', () => {
    render(
      <Text size="lg" tone="danger" data-testid="text">
        hi
      </Text>,
    )
    const el = screen.getByTestId('text')
    expect(el.className).toMatch(/size-lg/)
    expect(el.className).toMatch(/tone-danger/)
  })
})
