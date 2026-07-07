import { BookCarousel } from './BookCarousel'
import type { FinishedBook } from '../../types'

interface FinishedBooksProps {
  books: FinishedBook[]
}

export function FinishedBooks({ books }: FinishedBooksProps) {
  return (
    <BookCarousel
      label="Recently Finished"
      title="Recently Finished"
      books={books}
      emptyMessage="No books have been discussed yet."
    />
  )
}
