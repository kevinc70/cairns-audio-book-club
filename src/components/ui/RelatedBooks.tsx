import type { ShelfBook } from '../../types'
import { ArrowRight } from 'lucide-react'

interface RelatedBooksProps {
  books: ShelfBook[]
}

export function RelatedBooks({ books }: RelatedBooksProps) {
  return (
    <section className="related-books">
      <div className="section-trailer">
        <p className="eyebrow">Our Next Adventures</p>
        <h2>Books to explore next.</h2>
      </div>
      <div className="related-carousel">
        {books.map((book) => (
          <article key={book.title} className="related-book-card">
            <div className="related-cover" aria-hidden="true">
              <span>Cover</span>
            </div>
            <div className="related-copy">
              <h3>{book.title}</h3>
              <p>{book.author}</p>
              <button type="button" className="secondary-button">
                View details <ArrowRight size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
