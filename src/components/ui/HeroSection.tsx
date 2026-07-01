import type { HeroBook } from '../../types'
import { Star } from 'lucide-react'

interface HeroSectionProps {
  book: HeroBook
}

export function HeroSection({ book }: HeroSectionProps) {
  const progress = Math.max(0, Math.min(100, book.progress))

  return (
    <section className="hero-section">
      <div className="hero-visual">
        <div className="hero-cover" aria-hidden="true">
          <span>Book cover</span>
        </div>
      </div>
      <div className="hero-details">
        <p className="eyebrow">Featured listen</p>
        <h2>{book.title}</h2>
        <p className="hero-author">{book.author}</p>
        <div className="hero-rating">
          <Star size={18} />
          <span>{book.rating}</span>
        </div>
        <p className="hero-summary">{book.summary}</p>

        <div className="hero-meta-grid">
          <div>
            <p className="meta-label">Started</p>
            <p>{book.startedDate}</p>
          </div>
          <div>
            <p className="meta-label">Discussion</p>
            <p>{book.discussionDate}</p>
          </div>
        </div>

        <div className="progress-card">
          <div className="progress-label">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <button className="hero-action" type="button">
          Continue Listening
        </button>
      </div>
    </section>
  )
}
