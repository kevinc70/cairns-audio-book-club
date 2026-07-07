import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface BookCarouselItem {
  title: string
  author: string
  discussionDate?: string
  metaLines?: string[]
  slug?: string
  coverUrl?: string
}

interface BookCarouselProps {
  label: string
  title: string
  books: BookCarouselItem[]
  emptyMessage: string
  linkWholeCard?: boolean
}

export function BookCarousel({ label, title, books, emptyMessage, linkWholeCard = false }: BookCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)

  const scrollCarousel = (direction: 'left' | 'right') => {
    const carousel = carouselRef.current
    if (!carousel) return

    carousel.scrollBy({
      left: direction === 'left' ? -carousel.clientWidth * 0.8 : carousel.clientWidth * 0.8,
      behavior: 'smooth',
    })
  }

  return (
    <section className="book-carousel-section">
      <div className="book-carousel-header">
        <div>
          <p className="eyebrow">{label}</p>
          <h2>{title}</h2>
        </div>
        {books.length > 0 ? (
          <div className="book-carousel-controls" aria-label={`${label} carousel controls`}>
            <button type="button" aria-label={`Scroll ${label} left`} onClick={() => scrollCarousel('left')}>
              <ChevronLeft size={20} />
            </button>
            <button type="button" aria-label={`Scroll ${label} right`} onClick={() => scrollCarousel('right')}>
              <ChevronRight size={20} />
            </button>
          </div>
        ) : null}
      </div>
      {books.length === 0 ? (
        <p className="empty-state">{emptyMessage}</p>
      ) : (
        <div className="book-carousel-row" ref={carouselRef}>
          {books.map((book) => (
            <article key={book.slug ?? book.title} className="book-carousel-card">
              {linkWholeCard ? (
                <Link to={book.slug ? `/book/${book.slug}` : '/'} className="book-carousel-card-link" aria-label={`Open ${book.title}`}>
                  {book.coverUrl ? (
                    <img className="book-carousel-cover" src={book.coverUrl} alt={`${book.title} cover`} />
                  ) : (
                    <div className="book-carousel-cover book-carousel-cover-placeholder" aria-hidden="true">
                      <span>Cover</span>
                    </div>
                  )}
                  <div className="book-carousel-copy">
                    <h3>{book.title}</h3>
                    <p className="book-author">{book.author}</p>
                    {book.discussionDate ? <p className="book-carousel-date">{book.discussionDate}</p> : null}
                    {book.metaLines?.map((line) => (
                      <p key={line} className="book-carousel-date">
                        {line}
                      </p>
                    ))}
                  </div>
                </Link>
              ) : (
                <>
                  <Link
                    to={book.slug ? `/book/${book.slug}` : '/'}
                    className="book-carousel-cover-link"
                    aria-label={`Open ${book.title}`}
                  >
                    {book.coverUrl ? (
                      <img className="book-carousel-cover" src={book.coverUrl} alt={`${book.title} cover`} />
                    ) : (
                      <div className="book-carousel-cover book-carousel-cover-placeholder" aria-hidden="true">
                        <span>Cover</span>
                      </div>
                    )}
                  </Link>
                  <div className="book-carousel-copy">
                    <h3>{book.title}</h3>
                    <p className="book-author">{book.author}</p>
                    {book.discussionDate ? <p className="book-carousel-date">{book.discussionDate}</p> : null}
                    {book.metaLines?.map((line) => (
                      <p key={line} className="book-carousel-date">
                        {line}
                      </p>
                    ))}
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
