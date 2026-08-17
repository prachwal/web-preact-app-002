import { render, screen } from '@testing-library/preact'
import { describe, expect, it } from 'vitest'
import { Container } from './Container'

describe('Container', () => {
  it('applies the width modifier class', () => {
    render(
      <Container width="lg" data-testid="container">
        hi
      </Container>,
    )
    expect(screen.getByTestId('container').className).toMatch(/width-lg/)
  })
})
