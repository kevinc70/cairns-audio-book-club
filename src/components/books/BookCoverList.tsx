import { Link } from 'react-router-dom'
import { CalendarDays, Clock3, Star } from 'lucide-react'
import type { ShelfBook } from '../../types'

interface BookCoverListProps {
  items: ShelfBook[]
}

export default function BookCoverList({ items }: BookCoverListProps) {
  if (items.length === 0) {
    return <div className="book-cover-list empty-state">No books are available right now.</div>
  }

  return (
    <div className="book-cover-list" role="list">
      {items.map((item) => (
        <Link
          key={item.slug ?? item.title}
          to={item.slug ? `/book/${item.slug}` : '/'}
          className="book-cover-card"
          role="listitem">
          <div className="book-cover-placeholder" aria-hidden="true">
            <span>Book cover</span>
          </div>
          <div className="book-cover-meta">
            <div className="book-cover-tag">
              <Star size={14} />
              <span>{item.rating}</span>
            </div>
            <h3>{item.title}</h3>
            <p className="book-author">{item.author}</p>
            <div className="book-cover-details">
              <span>
                <Clock3 size={14} /> {item.readingTime}
              </span>
              <span>
                <CalendarDays size={14} /> {item.discussionDate}
              </span>
            </div>
            <p className="book-cover-description">{item.description}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
