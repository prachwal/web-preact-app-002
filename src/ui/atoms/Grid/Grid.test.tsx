import { render, screen } from '@testing-library/preact'
import { describe, expect, it } from 'vitest'
import { Grid } from './Grid'

describe('Grid', () => {
  it('applies the columns modifier class', () => {
    render(
      <Grid columns={4} data-testid="grid">
        hi
      </Grid>,
    )
    expect(screen.getByTestId('grid').className).toMatch(/columns-4/)
  })
})
