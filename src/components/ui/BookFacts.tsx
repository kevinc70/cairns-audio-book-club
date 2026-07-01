import type { BookFactsInfo } from '../../types'

interface BookFactsProps {
  facts: BookFactsInfo
}

export function BookFacts({ facts }: BookFactsProps) {
  return (
    <article className="book-facts-card">
      <div className="book-facts-header">
        <p className="eyebrow">Book details</p>
        <h2>All the essential story details.</h2>
      </div>
      <dl className="facts-list">
        <div>
          <dt>Author</dt>
          <dd>{facts.author}</dd>
        </div>
        <div>
          <dt>Narrator</dt>
          <dd>{facts.narrator}</dd>
        </div>
        <div>
          <dt>Publisher</dt>
          <dd>{facts.publisher}</dd>
        </div>
        <div>
          <dt>Runtime</dt>
          <dd>{facts.runtime}</dd>
        </div>
        <div>
          <dt>Genre</dt>
          <dd>{facts.genre}</dd>
        </div>
        <div>
          <dt>Release year</dt>
          <dd>{facts.releaseYear}</dd>
        </div>
        <div>
          <dt>ISBN</dt>
          <dd>{facts.isbn}</dd>
        </div>
      </dl>
    </article>
  )
}
