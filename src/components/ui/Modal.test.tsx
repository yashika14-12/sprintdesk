import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Delete task">
        <p>Are you sure?</p>
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the title and children when open, as an accessible dialog', () => {
    render(
      <Modal isOpen onClose={() => {}} title="Delete task">
        <p>Are you sure?</p>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Delete task')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Delete task">
        <p>Are you sure?</p>
      </Modal>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Delete task">
        <p>Are you sure?</p>
      </Modal>,
    );
    await userEvent.click(screen.getByTestId('modal-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking inside the dialog content', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Delete task">
        <p>Are you sure?</p>
      </Modal>,
    );
    await userEvent.click(screen.getByText('Are you sure?'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('moves focus into the dialog when opened', () => {
    render(
      <Modal isOpen onClose={() => {}} title="Delete task">
        <p>Are you sure?</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toHaveFocus();
  });

  it('wraps Tab from the last focusable element back to the first', async () => {
    render(
      <Modal isOpen onClose={() => {}} title="Delete task">
        <button type="button">Cancel</button>
        <button type="button">Confirm</button>
      </Modal>,
    );
    screen.getByRole('button', { name: 'Confirm' }).focus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });

  it('wraps Shift+Tab from the first focusable element back to the last', async () => {
    render(
      <Modal isOpen onClose={() => {}} title="Delete task">
        <button type="button">Cancel</button>
        <button type="button">Confirm</button>
      </Modal>,
    );
    screen.getByRole('button', { name: 'Cancel' }).focus();
    await userEvent.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveFocus();
  });

  it('does not steal focus back to the dialog when a re-render passes a new onClose while open', () => {
    const { rerender } = render(
      <Modal isOpen onClose={() => {}} title="Delete task">
        <button type="button">Confirm</button>
      </Modal>,
    );
    screen.getByRole('button', { name: 'Confirm' }).focus();
    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveFocus();

    rerender(
      <Modal isOpen onClose={() => {}} title="Delete task">
        <button type="button">Confirm</button>
      </Modal>,
    );

    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveFocus();
  });
});
