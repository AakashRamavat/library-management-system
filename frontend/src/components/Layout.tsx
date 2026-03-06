import { useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import './Layout.css';

export function Layout() {
  const { user, logout, ensureValidToken } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    ensureValidToken();
  }, [ensureValidToken]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            Library
          </Link>
          <nav className="nav">
            <Link to="/">Available Books</Link>
            <Link to="/my_books">My Books</Link>
          </nav>
          <div className="header-actions">
            {user ? (
              <>
                <span className="user-email">{user.email}</span>
                <button type="button" className="btn-secondary btn-sm" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary btn-sm">
                  Log in
                </Link>
                <Link to="/signup" className="btn-primary btn-sm">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
