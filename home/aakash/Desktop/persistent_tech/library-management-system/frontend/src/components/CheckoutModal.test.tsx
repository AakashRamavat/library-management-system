import { render, screen, userEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CheckoutModal } from './CheckoutModal';

describe('CheckoutModal', () => {
  it('shows title and book list', () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <CheckoutModal
        selectedBooks={[
          { id: '1', title: 'Clean Code' },
          { id: '2', title: 'Refactoring' },
        ]}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByRole('heading', { name: /confirm checkout/i })).toBeInTheDocument();
    expect(screen.getByText(/borrow the following books/i)).toBeInTheDocument();
    expect(screen.getByText('Clean Code')).toBeInTheDocument();
    expect(screen.getByText('Refactoring')).toBeInTheDocument();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <CheckoutModal
        selectedBooks={[{ id: '1', title: 'A Book' }]}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm when Checkout button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <CheckoutModal
        selectedBooks={[{ id: '1', title: 'A Book' }]}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole('button', { name: /checkout book/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });
});
