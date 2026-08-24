import { beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastContainer } from './ToastContainer';
import { __resetToastStore, addToast } from './toastStore';

describe('ToastContainer', () => {
  beforeEach(() => {
    __resetToastStore();
  });

  it('renders nothing when there are no toasts', () => {
    render(<ToastContainer />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders an active toast with its message', () => {
    render(<ToastContainer />);
    act(() => {
      addToast('Task created', 'success');
    });
    expect(screen.getByText('Task created')).toBeInTheDocument();
  });

  it('dismisses a toast when its close button is clicked', async () => {
    render(<ToastContainer />);
    act(() => {
      addToast('Task created', 'success');
    });
    await userEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(screen.queryByText('Task created')).not.toBeInTheDocument();
  });
});
