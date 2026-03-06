import { useEffect, useState } from 'react';
import { useBooksStore } from '../stores/booksStore';
import './HomePage.css';

const DEFAULT_LIMIT = 10;

export function HomePage() {
  const {
    books,
    total,
    page,
    limit,
    totalPages,
    isLoading,
    error,
    fetchBooks,
  } = useBooksStore();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchBooks(currentPage, DEFAULT_LIMIT);
  }, [currentPage, fetchBooks]);

  const availableCount = books.filter((b) => b.status === 'AVAILABLE').length;

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
  };

  if (isLoading && books.length === 0) {
    return (
      <div className="container">
        <p className="page-loading">Loading books…</p>
      </div>
    );
  }

  if (error && books.length === 0) {
    return (
      <div className="container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="container">
      <section className="hero">
        <h1 className="hero-title">Books</h1>
        <p className="hero-subtitle">
          {total} in the collection · {availableCount} available on this page
        </p>
      </section>

      {books.length === 0 ? (
        <p className="empty-state">No books in the catalog yet.</p>
      ) : (
        <>
          <ul className="book-grid">
            {books.map((book) => (
              <li key={book.id} className="book-card">
                <div className="book-card-content">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">{book.author}</p>
                  <span
                    className={`badge ${
                      book.status === 'AVAILABLE' ? 'badge-available' : 'badge-checked-out'
                    }`}
                  >
                    {book.status === 'AVAILABLE' ? 'Available' : 'Checked out'}
                  </span>
                  {book.holder && (
                    <p className="book-holder">
                      Held by {book.holder.name || book.holder.email}
                    </p>
                  )}
                </div>
                <div className="book-card-thumbnail">
                  {book.thumbnailUrl ? (
                    <img
                      src={book.thumbnailUrl}
                      alt=""
                      className="book-thumbnail-img"
                    />
                  ) : (
                    <div className="book-thumbnail-placeholder">No cover</div>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav className="pagination" aria-label="Books pagination">
              <button
                type="button"
                className="btn-secondary btn-pagination"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className="btn-secondary btn-pagination"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
