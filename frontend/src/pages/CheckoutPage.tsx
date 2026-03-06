import { useState, useEffect } from 'react';
import { useBooksStore } from '../stores/booksStore';
import './FormPage.css';

export function CheckoutPage() {
  const { books, fetchBooks, checkout, error, clearError } = useBooksStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastCount, setLastCount] = useState(0);

  useEffect(() => {
    fetchBooks(1, 100);
  }, [fetchBooks]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const availableBooks = books.filter((b) => b.status === 'AVAILABLE');

  const toggleBook = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === availableBooks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(availableBooks.map((b) => b.id)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bookIds = Array.from(selectedIds);
    if (bookIds.length === 0) return;
    setSubmitting(true);
    setSuccess(false);
    try {
      await checkout(bookIds);
      setLastCount(bookIds.length);
      setSelectedIds(new Set());
      setSuccess(true);
    } catch {
      // error in store
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container form-page">
      <section className="form-hero">
        <h1 className="form-title">Check out books</h1>
        <p className="form-subtitle">
          Select one or more books to borrow. Only available books are listed.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="form-card">
        {availableBooks.length > 0 && (
          <div className="form-group">
            <button
              type="button"
              className="btn-link select-all"
              onClick={selectAll}
            >
              {selectedIds.size === availableBooks.length
                ? 'Clear selection'
                : 'Select all'}
            </button>
          </div>
        )}
        <div className="form-group book-list">
          {availableBooks.length === 0 ? (
            <p className="form-hint">No books available to check out.</p>
          ) : (
            <ul className="checkbox-list">
              {availableBooks.map((b) => (
                <li key={b.id} className="checkbox-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(b.id)}
                      onChange={() => toggleBook(b.id)}
                    />
                    <span className="checkbox-text">
                      {b.title} — {b.author}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
        {error && <p className="error-message">{error}</p>}
        {success && (
          <p className="success-message">
            {lastCount === 1
              ? 'Book checked out successfully.'
              : `${lastCount} books checked out successfully.`}
          </p>
        )}
        <button
          type="submit"
          className="btn-primary"
          disabled={
            submitting || selectedIds.size === 0 || availableBooks.length === 0
          }
        >
          {submitting
            ? 'Checking out…'
            : `Check out ${selectedIds.size > 0 ? `(${selectedIds.size})` : ''}`}
        </button>
      </form>
    </div>
  );
}
