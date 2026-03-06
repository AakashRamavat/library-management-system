import { useEffect, useState } from 'react'
import { useBooksStore } from '../stores/booksStore'
import { CheckoutModal } from '../components/CheckoutModal'
import './Dashboard.css'

const DEFAULT_LIMIT = 10

export function HomePage() {

  const {
    books,
    fetchBooks,
    checkout
  } = useBooksStore()

  const [page] = useState(1)

  const [selectedBooks, setSelectedBooks] = useState<string[]>([])

  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchBooks(page, DEFAULT_LIMIT)
  }, [page])

  const toggleBook = (id: string) => {

    setSelectedBooks(prev =>
      prev.includes(id)
        ? prev.filter(b => b !== id)
        : [...prev, id]
    )
  }

  const openCheckout = () => {
    setShowModal(true)
  }

  const cancelCheckout = () => {
    setShowModal(false)
    setSelectedBooks([])
  }

  const confirmCheckout = async () => {

    await checkout(selectedBooks)

    setSelectedBooks([])
    setShowModal(false)
  }

  const availableBooks = books.filter(
    b => b.status === 'AVAILABLE'
  )

  return (
    <div className="container">


      <div className="books-header">

        <button
          className="btn-primary"
          disabled={!selectedBooks.length}
          onClick={openCheckout}
        >
          Checkout
        </button>

      </div>

      <ul className="book-grid">

        {availableBooks.map(book => (

          <li
            key={book.id}
            className="book-card"
            onClick={() => toggleBook(book.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggleBook(book.id)
              }
            }}
            role="button"
            tabIndex={0}
          >

            <input
              type="checkbox"
              className="book-checkbox"
              checked={selectedBooks.includes(book.id)}
              readOnly
              tabIndex={-1}
              aria-hidden="true"
            />

            <div className="book-card-content">

              <h3 className="book-title">
                {book.title}
              </h3>

              <p className="book-author">
                {book.author}
              </p>
            </div>

            <div className="book-card-thumbnail">

              {book.thumbnailUrl ? (
                <img
                  src={book.thumbnailUrl}
                  className="book-thumbnail-img"
                />
              ) : (
                <div className="book-thumbnail-placeholder">
                  No Cover
                </div>
              )}

            </div>

          </li>

        ))}

      </ul>

      {showModal && (

        <CheckoutModal
          selectedBooks={books
            .filter(b => selectedBooks.includes(b.id))
            .map(b => ({ id: b.id, title: b.title }))
          }
          onCancel={cancelCheckout}
          onConfirm={confirmCheckout}
        />

      )}

    </div>
  )
}