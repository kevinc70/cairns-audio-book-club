import type { RatingReview } from '../../types'

interface RatingCardProps {
  review: RatingReview
}

export function RatingCard({ review }: RatingCardProps) {
  return (
    <article className="rating-card">
      <div className="rating-card-top">
        <div className="rating-avatar" aria-hidden="true">
          {review.initial}
        </div>
        <div>
          <h3>{review.name}</h3>
          <p className="rating-stars">{review.rating}</p>
        </div>
      </div>
      <p className="rating-text">“{review.review}”</p>
    </article>
  )
}
