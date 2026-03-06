import { useState } from 'react'
import { useBooksStore } from '../stores/booksStore'
import { useAuthStore } from '../stores/authStore'
import { ReturnModal } from '../components/ReturnModal'
import './HomePage.css'

export function MyBooksPage() {

  const { books, returnBook } = useBooksStore()

  const { user } = useAuthStore()

  const [selectedBooks, setSelectedBooks] = useState<string[]>([])
  const [showModal, setShowModal] = useState(false)

  const myBooks = books.filter(
    b => b.holderId === user?.id
  )

  const toggleBook = (id: string) => {

    setSelectedBooks(prev =>
      prev.includes(id)
        ? prev.filter(b => b !== id)
        : [...prev, id]
    )
  }

  const cancelReturn = () => {
    setShowModal(false)
    setSelectedBooks([])
  }

  const confirmReturn = async () => {

    await returnBook(selectedBooks)

    setSelectedBooks([])
    setShowModal(false)
  }

  return (
    <div className="container">
     
      <div className="books-header">
        <button
          className="btn-primary"
          disabled={!selectedBooks.length}
          onClick={() => setShowModal(true)}
        >
          Return
        </button>
      </div>

      <ul className="book-grid">

        {myBooks.map(book => (

          <li
            key={book.id}
            className="book-card"
          >

            <input
              type="checkbox"
              className="book-checkbox"
              checked={selectedBooks.includes(book.id)}
              onChange={() => toggleBook(book.id)}
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

<ReturnModal
selectedBooks={books
  .filter(b => selectedBooks.includes(b.id))
  .map(b => ({ id: b.id, title: b.title }))
}
onCancel={cancelReturn}
onConfirm={confirmReturn}
/>

      )}

    </div>
  )
}