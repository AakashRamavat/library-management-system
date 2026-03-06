import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useBooksStore } from '../stores/booksStore';
import './FormPage.css';

export function ReturnPage() {
  const { user } = useAuthStore();
  const { books, fetchBooks, returnBook, error, clearError } = useBooksStore();
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

  const myCheckedOutBooks = books.filter(
    (b) => b.status === 'CHECKED_OUT' && b.holder?.id === user?.id,
  );

  const toggleBook = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === myCheckedOutBooks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(myCheckedOutBooks.map((b) => b.id)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bookIds = Array.from(selectedIds);
    if (bookIds.length === 0) return;
    setSubmitting(true);
    setSuccess(false);
    try {
      await returnBook(bookIds);
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
        <h1 className="form-title">Return books</h1>
        <p className="form-subtitle">
          Select one or more books you’re returning. Only books you have checked
          out are listed.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="form-card">
        {myCheckedOutBooks.length > 0 && (
          <div className="form-group">
            <button
              type="button"
              className="btn-link select-all"
              onClick={selectAll}
            >
              {selectedIds.size === myCheckedOutBooks.length
                ? 'Clear selection'
                : 'Select all'}
            </button>
          </div>
        )}
        <div className="form-group book-list">
          {myCheckedOutBooks.length === 0 ? (
            <p className="form-hint">No books currently checked out by you.</p>
          ) : (
            <ul className="checkbox-list">
              {myCheckedOutBooks.map((b) => (
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
              ? 'Book returned successfully.'
              : `${lastCount} books returned successfully.`}
          </p>
        )}
        <button
          type="submit"
          className="btn-primary"
          disabled={
            submitting ||
            selectedIds.size === 0 ||
            myCheckedOutBooks.length === 0
          }
        >
          {submitting
            ? 'Returning…'
            : `Return ${selectedIds.size > 0 ? `(${selectedIds.size})` : ''}`}
        </button>
      </form>
    </div>
  );
}
