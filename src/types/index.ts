export interface NavItem {
  id: string
  label: string
  icon: string
}

export interface Member {
  name: string
  initial: string
  booksCompleted: number
  favoriteGenre: string
  currentlyListening: string
}

export interface ShelfBook {
  title: string
  author: string
  rating: string
  readingTime: string
  discussionDate: string
  description: string
}

export interface FinishedBook {
  title: string
  author: string
  discussionDate: string
  rating: string
  quote: string
}

export interface JourneyItem {
  year: string
  title: string
  discussionDate: string
  notes: string
  rating: string
}

export interface ActivityItem {
  title: string
  description: string
  time: string
}

export interface ProgressInfo {
  complete: number
  lastListened: string
  timeRemaining: string
}

export interface RatingReview {
  name: string
  initial: string
  rating: string
  review: string
}

export interface QuoteItem {
  text: string
  source: string
}

export type DiscussionBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; text: string[] }

export interface DiscussionNote {
  title: string
  blocks: DiscussionBlock[]
}

export interface PhotoItem {
  id: string
}

export interface BookFactsInfo {
  author: string
  narrator: string
  publisher: string
  runtime: string
  genre: string
  releaseYear: string
  isbn: string
}

export interface HeroBook {
  title: string
  author: string
  rating: string
  startedDate: string
  discussionDate: string
  progress: number
  summary: string
  genre?: string
  length?: string
  narrator?: string
  finishedDate?: string
  familyRating?: string
}
