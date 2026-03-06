interface Props {
  selectedBooks: { id: string; title: string }[]
  onCancel: () => void
  onConfirm: () => void
}

export function CheckoutModal({
  selectedBooks,
  onCancel,
  onConfirm
}: Props) {

  const single = selectedBooks.length === 1

  return (
    <div className="modal-overlay">

      <div className="modal">

        <h2>Confirm Checkout</h2>

        <p>
          {single
            ? 'You are about to checkout the following book:'
            : 'You are about to checkout the following books:'}
        </p>

        <ul className="modal-book-list">
          {selectedBooks.map(book => (
            <li key={book.id}>
              {book.title}
            </li>
          ))}
        </ul>

        <div className="modal-actions">

          <button
            className="btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="btn-primary"
            onClick={onConfirm}
          >
            Checkout Books
          </button>

        </div>

      </div>

    </div>
  )
}