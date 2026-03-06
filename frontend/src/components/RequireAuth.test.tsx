import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { RequireAuth } from './RequireAuth';

vi.mock('../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

const { useAuthStore } = await import('../stores/authStore');

function renderWithRouter(authToken: string | null) {
  vi.mocked(useAuthStore).mockImplementation((selector: (s: { accessToken: string | null }) => unknown) =>
    selector({ accessToken: authToken }) as never,
  );
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route
          path="/protected"
          element={
            <RequireAuth>
              <div data-testid="protected-content">Protected</div>
            </RequireAuth>
          }
        />
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireAuth', () => {
  it('renders children when user has access token', () => {
    renderWithRouter('some-token');
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Protected')).toBeInTheDocument();
  });

  it('redirects to login when no access token', () => {
    renderWithRouter(null);
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});
