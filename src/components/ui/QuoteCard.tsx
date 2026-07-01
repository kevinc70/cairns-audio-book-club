import type { QuoteItem } from '../../types'

interface QuoteCardProps {
  quote: QuoteItem
}

export function QuoteCard({ quote }: QuoteCardProps) {
  return (
    <article className="quote-card">
      <span className="quote-mark">“</span>
      <div>
        <p>{quote.text}</p>
        <p className="quote-source">{quote.source}</p>
      </div>
    </article>
  )
}
