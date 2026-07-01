import type { ShelfBook } from '../../types'

interface RelatedBooksProps {
  books: ShelfBook[]
}

export function RelatedBooks({ books }: RelatedBooksProps) {
  if (books.length === 0) {
    return (
      <section className="related-books">
        <div className="section-trailer">
          <p className="eyebrow">Our Next Adventures</p>
          <h2>Books to explore next.</h2>
        </div>
        <p className="empty-state">No similar books have been found yet.</p>
      </section>
    )
  }

  return (
    <section className="related-books">
      <div className="section-trailer">
        <p className="eyebrow">Our Next Adventures</p>
        <h2>Books to explore next.</h2>
      </div>
      <div className="related-carousel">
        {books.map((book) => (
          <article key={book.slug ?? book.title} className="related-book-card">
            <div className="related-cover" aria-hidden="true">
              <span>Cover</span>
            </div>
            <div className="related-copy">
              <h3>{book.title}</h3>
              <p>{book.author}</p>
              <p className="related-meta">
                {book.rating} · {book.readingTime}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
