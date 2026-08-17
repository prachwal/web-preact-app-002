import { act, render, screen, waitFor } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastViewport, toast } from './Toast'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  toast.clear()
  vi.useRealTimers()
})

describe('Toast', () => {
  it('adding a toast renders it, dismissing removes it', async () => {
    render(<ToastViewport />)
    let id = ''
    act(() => {
      id = toast.show({ title: 'Saved', duration: 0 })
    })
    expect(screen.getByText('Saved')).toBeInTheDocument()

    act(() => {
      toast.dismiss(id)
    })
    await waitFor(() => expect(screen.queryByText('Saved')).not.toBeInTheDocument())
  })

  it('auto-dismisses after its duration', async () => {
    render(<ToastViewport />)
    act(() => {
      toast.show({ title: 'Auto', duration: 1000 })
    })
    expect(screen.getByText('Auto')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    await waitFor(() => expect(screen.queryByText('Auto')).not.toBeInTheDocument())
  })

  it('aria-live politeness matches the type: danger is assertive, others polite', () => {
    render(<ToastViewport />)
    act(() => {
      toast.show({ title: 'Error', type: 'danger', duration: 0 })
      toast.show({ title: 'Info', type: 'info', duration: 0 })
    })
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive')
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  })
})
