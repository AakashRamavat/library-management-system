import './Modal.css';

interface Props {
  selectedBooks: { id: string; title: string }[];
  onCancel: () => void;
  onConfirm: () => void;
}

export function CheckoutModal({
  selectedBooks,
  onCancel,
  onConfirm,
}: Props) {
  const single = selectedBooks.length === 1;

  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="checkout-modal-title">
      <div
        className="modal-dialog modal-dialog--checkout"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-icon-wrap" aria-hidden="true">
            📚
          </div>
          <h2 id="checkout-modal-title" className="modal-title">
            Confirm Checkout
          </h2>
        </div>
        <div className="modal-body">
          <p className="modal-message">
            {single
              ? 'You are about to borrow the following book:'
              : 'You are about to borrow the following books:'}
          </p>
          <ul className="modal-book-list">
            {selectedBooks.map((book) => (
              <li key={book.id}>{book.title}</li>
            ))}
          </ul>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={onConfirm}>
            {single ? 'Checkout Book' : 'Checkout Books'}
          </button>
        </div>
      </div>
    </div>
  );
}
