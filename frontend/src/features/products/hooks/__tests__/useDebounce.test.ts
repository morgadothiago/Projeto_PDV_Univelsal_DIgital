/**
 * useDebounce — unit tests
 *
 * Coverage:
 *  - returns initial value immediately
 *  - debounces value update by specified delay
 *  - cancels previous timer on rapid changes (only last value applied)
 */

import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300))
    expect(result.current).toBe('initial')
  })

  it('does not update the value before the delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'initial' },
    })

    rerender({ value: 'updated' })
    // Before timer fires
    expect(result.current).toBe('initial')
  })

  it('updates the value after the delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'initial' },
    })

    rerender({ value: 'updated' })
    act(() => {
      jest.advanceTimersByTime(300)
    })
    expect(result.current).toBe('updated')
  })

  it('only applies the last value on rapid successive changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'initial' },
    })

    rerender({ value: 'first' })
    act(() => { jest.advanceTimersByTime(100) })
    rerender({ value: 'second' })
    act(() => { jest.advanceTimersByTime(100) })
    rerender({ value: 'final' })
    act(() => { jest.advanceTimersByTime(300) })

    expect(result.current).toBe('final')
  })
})
