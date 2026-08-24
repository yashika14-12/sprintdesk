import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useToast } from './useToast';
import { __resetToastStore } from './toastStore';

describe('useToast', () => {
  beforeEach(() => {
    __resetToastStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with no toasts', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it('showToast adds a toast with the given message and variant', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.showToast('Task created', 'success');
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({ message: 'Task created', variant: 'success' });
  });

  it('defaults to the info variant when none is given', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.showToast('Heads up');
    });
    expect(result.current.toasts[0].variant).toBe('info');
  });

  it('queues multiple toasts in the order they were shown', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.showToast('First');
      result.current.showToast('Second');
    });
    expect(result.current.toasts.map((t) => t.message)).toEqual(['First', 'Second']);
  });

  it('dismissToast removes a toast by id', () => {
    const { result } = renderHook(() => useToast());
    let id = '';
    act(() => {
      id = result.current.showToast('Dismiss me');
    });
    act(() => {
      result.current.dismissToast(id);
    });
    expect(result.current.toasts).toEqual([]);
  });

  it('auto-dismisses a toast after its duration elapses', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.showToast('Auto', 'info', 3000);
    });
    expect(result.current.toasts).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it('does not auto-dismiss when duration is 0', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.showToast('Sticky', 'info', 0);
    });
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current.toasts).toHaveLength(1);
  });
});
