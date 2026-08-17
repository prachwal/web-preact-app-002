import { fireEvent, render, screen } from '@testing-library/preact'
import { describe, expect, it } from 'vitest'
import { Tabs } from './Tabs'

function renderTabs(defaultValue = 'a') {
  return render(
    <Tabs.Root defaultValue={defaultValue}>
      <Tabs.List>
        <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
        <Tabs.Trigger value="b">Tab B</Tabs.Trigger>
        <Tabs.Trigger value="c">Tab C</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="a">Panel A</Tabs.Panel>
      <Tabs.Panel value="b">Panel B</Tabs.Panel>
      <Tabs.Panel value="c">Panel C</Tabs.Panel>
    </Tabs.Root>,
  )
}

describe('Tabs', () => {
  it('shows only the active panel, following `value`', () => {
    renderTabs()
    expect(screen.getByText('Panel A')).toBeInTheDocument()
    expect(screen.queryByText('Panel B')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Tab B' }))
    expect(screen.getByText('Panel B')).toBeInTheDocument()
    expect(screen.queryByText('Panel A')).not.toBeInTheDocument()
  })

  it('moves selection and focus with ArrowRight/ArrowLeft', () => {
    renderTabs()
    const tabA = screen.getByRole('tab', { name: 'Tab A' })
    tabA.focus()

    fireEvent.keyDown(tabA, { key: 'ArrowRight' })
    expect(screen.getByRole('tab', { name: 'Tab B' })).toHaveFocus()
    expect(screen.getByText('Panel B')).toBeInTheDocument()

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Tab B' }), { key: 'ArrowLeft' })
    expect(screen.getByRole('tab', { name: 'Tab A' })).toHaveFocus()
  })
})
