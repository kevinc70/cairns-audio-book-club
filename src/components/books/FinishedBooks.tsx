import { Link } from 'react-router-dom'

interface FinishedBook {
  title: string
  author: string
  discussionDate: string
  rating: string
  quote: string
}

interface FinishedBooksProps {
  books: FinishedBook[]
}

export function FinishedBooks({ books }: FinishedBooksProps) {
  return (
    <section className="finished-books-section">
      <div className="section-trailer">
        <p className="eyebrow">Recently finished</p>
        <h2>Collectible stories we loved.</h2>
      </div>
      <div className="finished-books-grid">
        {books.map((book) => (
          <Link key={book.title} to="/book/the-hobbit" className="finished-book-card">
            <div className="finished-cover" aria-hidden="true">
              <span>Book cover</span>
            </div>
            <div className="finished-copy">
              <h3>{book.title}</h3>
              <p className="book-author">{book.author}</p>
              <p>Discussion: {book.discussionDate}</p>
              <p className="book-rating">Family rating: {book.rating}</p>
              <blockquote>“{book.quote}”</blockquote>
              <p className="notes-link">View notes</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
