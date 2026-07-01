import { CalendarDays, Star } from 'lucide-react'
import type { JourneyItem } from '../../types'

interface ReadingTimelineProps {
  items: JourneyItem[]
}

export function ReadingTimeline({ items }: ReadingTimelineProps) {
  return (
    <section className="reading-timeline">
      <div className="timeline-heading">
        <p className="eyebrow">Reading journey</p>
        <h2>Books that shaped our listening year</h2>
      </div>
      <div className="timeline-track">
        {items.map((item) => (
          <article key={item.title} className="timeline-card">
            <div className="timeline-year">{item.year}</div>
            <div className="timeline-body">
              <h3>{item.title}</h3>
              <div className="timeline-meta">
                <Star size={14} />
                <span>{item.rating}</span>
                <CalendarDays size={14} />
                <span>{item.discussionDate}</span>
              </div>
              <p>{item.notes}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
