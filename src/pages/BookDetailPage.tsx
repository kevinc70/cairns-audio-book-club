import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BookHero } from '../components/ui/BookHero'
import { ProgressCard } from '../components/ui/ProgressCard'
import { RatingCard } from '../components/ui/RatingCard'
import { QuoteCard } from '../components/ui/QuoteCard'
import { DiscussionCard } from '../components/ui/DiscussionCard'
import { PhotoGallery } from '../components/ui/PhotoGallery'
import { BookFacts } from '../components/ui/BookFacts'
import { RelatedBooks } from '../components/ui/RelatedBooks'
import { ReadingTimeline } from '../components/books/ReadingTimeline'
import { AppShell } from '../components/layout/AppShell'
import { supabase } from '../lib/supabase'
import type {
  HeroBook,
  ProgressInfo,
  RatingReview,
  QuoteItem,
  DiscussionNote,
  PhotoItem,
  BookFactsInfo,
  ShelfBook,
  JourneyItem,
} from '../types'

const progressInfo: ProgressInfo = {
  complete: 82,
  lastListened: 'Yesterday',
  timeRemaining: '6 hr 12 min',
}

const ratings: RatingReview[] = [
  {
    name: 'Kevin',
    initial: 'K',
    rating: '★★★★★',
    review: 'My favourite chapter was the dragon encounter—it felt cinematic and warm.',
  },
  {
    name: 'Emma',
    initial: 'E',
    rating: '★★★★☆',
    review: 'The dragon scenes were incredible, and the narration felt so cozy.',
  },
  {
    name: 'Liam',
    initial: 'L',
    rating: '★★★★★',
    review: 'I want to read it again; the story feels like a timeless adventure.',
  },
]

const quotes: QuoteItem[] = [
  {
    text: 'It does not do to leave a live dragon out of your calculations.',
    source: '— J.R.R. Tolkien',
  },
  {
    text: 'There is nothing like looking, if you want to find something.',
    source: '— J.R.R. Tolkien',
  },
]

const discussionNote: DiscussionNote = {
  title: 'Family Discussion Notes',
  blocks: [
    { type: 'heading', text: 'Memorable moments' },
    {
      type: 'paragraph',
      text: 'We loved the warmth of the story, the sense of journey, and the bond between the characters.',
    },
    { type: 'heading', text: 'Highlights' },
    {
      type: 'list',
      text: [
        'The dragon scene was unforgettable',
        'The humor in the hobbit village felt like home',
        'The narration added softness to every scene',
      ],
    },
    { type: 'paragraph', text: 'We agreed this listen felt like a family adventure, one we can return to again and again.' },
  ],
}

const photos: PhotoItem[] = [
  { id: '1' },
  { id: '2' },
  { id: '3' },
  { id: '4' },
]

const facts: BookFactsInfo = {
  author: 'J.R.R. Tolkien',
  narrator: 'Andy Serkis',
  publisher: 'HarperCollins',
  runtime: '11 hr 32 min',
  genre: 'Fantasy',
  releaseYear: '1937',
  isbn: '978-0261103344',
}

const relatedBooks: ShelfBook[] = [
  {
    title: 'The Night Circus',
    author: 'Erin Morgenstern',
    rating: '4.9',
    readingTime: '9 hrs',
    discussionDate: 'Aug 2',
    description: 'A luminous tale of wonder, magic, and family promise.',
  },
  {
    title: 'The Paper Garden',
    author: 'Julia Glass',
    rating: '4.7',
    readingTime: '8 hrs',
    discussionDate: 'Sept 7',
    description: 'A gentle story of family, memory, and quiet light.',
  },
]

const journeyItems: JourneyItem[] = [
  {
    year: 'Previous',
    title: 'Under the Elm Tree',
    discussionDate: 'May 22',
    notes: 'A warm intro to our current listening season.',
    rating: '★★★★★',
  },
  {
    year: 'Current',
    title: 'The Hobbit',
    discussionDate: 'May 2',
    notes: 'The family favorite adventure in focus.',
    rating: '★★★★★',
  },
  {
    year: 'Next',
    title: 'The Night Circus',
    discussionDate: 'Aug 2',
    notes: 'A dreamy next listen reserved for summer evenings.',
    rating: '★★★★☆',
  },
]

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [currentBook, setCurrentBook] = useState<HeroBook | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBook = async () => {
      console.log('BookDetail slug:', id)

      if (!id) {
        setError('No book selected.')
        setLoading(false)
        return
      }

      setError(null)
      setLoading(true)

      const { data, error: fetchError } = await supabase
        .from('books')
        .select(
          'title, author, rating, genre, length, narrator, started_date, finished_date, discussion_date, family_rating, summary, progress'
        )
        .eq('slug', id)
        .single()

      console.log('Supabase book data:', data)
      console.log('Supabase book error:', fetchError)

      if (fetchError) {
        setError('Unable to load this book. Please try again later.')
        setLoading(false)
        return
      }

      if (!data) {
        setError('Book not found. Please select another title.')
        setLoading(false)
        return
      }

      setCurrentBook({
        title: data.title,
        author: data.author,
        rating: data.rating,
        genre: data.genre,
        length: data.length,
        narrator: data.narrator,
        startedDate: data.started_date,
        finishedDate: data.finished_date,
        discussionDate: data.discussion_date,
        familyRating: data.family_rating,
        progress: data.progress,
        summary: data.summary,
      })
      setLoading(false)
    }

    fetchBook()
  }, [id])

  if (loading) {
    return (
      <AppShell>
        <section className="page-section">
          <header className="page-header">
            <p className="eyebrow">Loading</p>
            <h1>Fetching your book details...</h1>
            <p className="intro-text">Please wait while we load the story from the library.</p>
          </header>
        </section>
      </AppShell>
    )
  }

  if (error || !currentBook) {
    return (
      <AppShell>
        <section className="page-section">
          <header className="page-header">
            <p className="eyebrow">Book not available</p>
            <h1>{error ?? 'We could not find that book.'}</h1>
            <p className="intro-text">Try returning to the homepage and selecting another title.</p>
          </header>
        </section>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <article className="book-detail-page">
        <BookHero book={currentBook} />

        <div className="book-detail-grid">
          <ProgressCard progress={progressInfo} />

          <section className="ratings-section">
            <div className="section-trailer">
              <p className="eyebrow">Our ratings</p>
              <h2>What our family said about this listen.</h2>
            </div>
            <div className="ratings-grid">
              {ratings.map((review) => (
                <RatingCard key={review.name} review={review} />
              ))}
            </div>
          </section>
        </div>

        <section className="quotes-section">
          <div className="section-trailer">
            <p className="eyebrow">Favourite quotes</p>
            <h2>Lines we want to remember.</h2>
          </div>
          <div className="quotes-grid">
            {quotes.map((quote) => (
              <QuoteCard key={quote.text} quote={quote} />
            ))}
          </div>
        </section>

        <DiscussionCard note={discussionNote} />

        <section className="video-section">
          <div className="section-trailer">
            <p className="eyebrow">Video discussion</p>
            <h2>Family Discussion • April 12, 2026</h2>
          </div>
          <div className="video-card" aria-hidden="true">
            <div className="video-thumbnail">
              <span>Video thumbnail</span>
            </div>
          </div>
        </section>

        <PhotoGallery photos={photos} />

        <div className="details-and-related">
          <BookFacts facts={facts} />
          <RelatedBooks books={relatedBooks} />
        </div>

        <ReadingTimeline items={journeyItems} />

        <footer className="book-detail-footer">
          <p className="eyebrow">When we listened</p>
          <div className="footer-grid">
            <div>
              <p className="footer-label">Date started</p>
              <p>March 12</p>
            </div>
            <div>
              <p className="footer-label">Date finished</p>
              <p>April 28</p>
            </div>
            <div>
              <p className="footer-label">Recommended by</p>
              <p>Emma</p>
            </div>
            <div>
              <p className="footer-label">Participants</p>
              <p>4 family members</p>
            </div>
          </div>
        </footer>
      </article>
    </AppShell>
  )
}
