import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ReturnModal } from './ReturnModal';

describe('ReturnModal', () => {
  it('shows title and book list', () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <ReturnModal
        selectedBooks={[
          { id: '1', title: 'Clean Code' },
          { id: '2', title: 'Refactoring' },
        ]}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByRole('heading', { name: /confirm return/i })).toBeInTheDocument();
    expect(screen.getByText(/return the following books/i)).toBeInTheDocument();
    expect(screen.getByText('Clean Code')).toBeInTheDocument();
    expect(screen.getByText('Refactoring')).toBeInTheDocument();
  });

  it('calls onConfirm when Return Books is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ReturnModal
        selectedBooks={[{ id: '1', title: 'A Book' }, { id: '2', title: 'Another' }]}
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole('button', { name: /return books/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
