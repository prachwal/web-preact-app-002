import { render, screen } from '@testing-library/preact'
import { describe, expect, it } from 'vitest'
import { Stack } from './Stack'

describe('Stack', () => {
  it('applies the direction modifier class', () => {
    render(
      <Stack direction="row" data-testid="stack">
        hi
      </Stack>,
    )
    expect(screen.getByTestId('stack').className).toMatch(/direction-row/)
  })

  it('applies the gap token as a CSS var', () => {
    render(
      <Stack gap={8} data-testid="stack">
        hi
      </Stack>,
    )
    expect(screen.getByTestId('stack')).toHaveStyle({ '--stack-gap': 'var(--space-8)' })
  })
})
