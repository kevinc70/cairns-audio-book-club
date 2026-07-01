import type { HeroBook } from '../../types'
import { Link } from 'react-router-dom'
import { Star, Play } from 'lucide-react'

interface BookHeroProps {
  book: HeroBook
  linkTo?: string
}

export function BookHero({ book, linkTo }: BookHeroProps) {
  return (
    <section className="book-hero">
      <Link to={linkTo ?? '#'} className="book-hero-cover-link">
        <div className="book-hero-cover" aria-hidden="true">
          <div className="cover-shine" />
          <span>Book cover</span>
        </div>
      </Link>

      <div className="book-hero-details">
        <div className="book-hero-intro">
          <p className="eyebrow">Now in focus</p>
          <h1>{book.title}</h1>
          <p className="book-author">{book.author}</p>
          <div className="book-meta-row">
            <span>
              <Star size={18} /> {book.rating}
            </span>
            <span>{book.genre}</span>
          </div>
        </div>

        <div className="book-hero-grid">
          <div>
            <p className="label">Length</p>
            <p>{book.length}</p>
          </div>
          <div>
            <p className="label">Narrator</p>
            <p>{book.narrator}</p>
          </div>
          <div>
            <p className="label">Started</p>
            <p>{book.startedDate}</p>
          </div>
          <div>
            <p className="label">Finished</p>
            <p>{book.finishedDate}</p>
          </div>
          <div>
            <p className="label">Discussion</p>
            <p>{book.discussionDate}</p>
          </div>
          <div>
            <p className="label">Family rating</p>
            <p>{book.familyRating}</p>
          </div>
        </div>

        <div className="book-hero-actions">
          <button className="primary-button" type="button">
            <Play size={18} /> Watch Discussion
          </button>
          <button className="secondary-button" type="button">
            Discussion Notes
          </button>
        </div>
      </div>
    </section>
  )
}
