interface Props {
  selectedBooks: { id: string; title: string }[]
  onCancel: () => void
  onConfirm: () => void
}

export function ReturnModal({
  selectedBooks,
  onCancel,
  onConfirm
}: Props) {

  const single = selectedBooks.length === 1

  return (
    <div className="modal-overlay">

      <div className="modal">

        <h2>Confirm Return</h2>

        <p>
          {single
            ? 'You are about to return the following book:'
            : 'You are about to return the following books:'}
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
            Return Books
          </button>

        </div>

      </div>

    </div>
  )
}