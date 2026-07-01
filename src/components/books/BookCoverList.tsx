import { Link } from 'react-router-dom'
import { CalendarDays, Clock3, Star } from 'lucide-react'
import type { ShelfBook } from '../../types'

interface BookCoverListProps {
  items: ShelfBook[]
}

export default function BookCoverList({ items }: BookCoverListProps) {
  return (
    <div className="book-cover-list" role="list">
      {items.map((item) => (
        <Link key={item.title} to="/book/the-hobbit" className="book-cover-card" role="listitem">
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

      <article className="book-cover-card add-book-card" role="listitem">
        <div className="book-cover-placeholder add-cover" aria-hidden="true">
          <span>Add Book</span>
        </div>
        <div className="book-cover-meta">
          <h3>Add your next adventure</h3>
          <p className="book-author">A new story waiting on the shelf.</p>
          <div className="book-cover-details add-details">
            <span>Pick a title</span>
            <span>Plan a discussion</span>
          </div>
          <p className="book-cover-description">
            Keep our shelf full of stories everyone is excited to listen to.
          </p>
        </div>
      </article>
    </div>
  )
}
