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

function formatDate(date: string | null | undefined) {
  if (!date) return 'TBD'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return 'TBD'
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatRuntime(runtime: number | null | undefined) {
  if (!runtime && runtime !== 0) return 'Unknown'
  const hours = Math.floor(runtime / 60)
  const minutes = runtime % 60
  return hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`
}

function formatRating(familyRating: number | null | undefined) {
  if (!familyRating && familyRating !== 0) return '★' 
  return `${familyRating.toFixed(1)} ★`
}

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [currentBook, setCurrentBook] = useState<HeroBook | null>(null)
  const [progressInfo, setProgressInfo] = useState<ProgressInfo>({
    complete: 0,
    lastListened: '',
    timeRemaining: '',
  })
  const [ratings, setRatings] = useState<RatingReview[]>([])
  const [quotes, setQuotes] = useState<QuoteItem[]>([])
  const [discussionNote, setDiscussionNote] = useState<DiscussionNote | null>(null)
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [facts, setFacts] = useState<BookFactsInfo | null>(null)
  const [relatedBooks, setRelatedBooks] = useState<ShelfBook[]>([])
  const [journeyItems, setJourneyItems] = useState<JourneyItem[]>([])
  const [participantsCount, setParticipantsCount] = useState(0)
  const [recommendedBy, setRecommendedBy] = useState('Unknown')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) {
        setError('No book selected.')
        setLoading(false)
        return
      }

      setError(null)
      setLoading(true)

      const { data: book, error: bookError } = await supabase
        .from('books')
        .select(
          'id,slug,title,author,genre,summary,family_rating,progress,status,started_date,completed_date,discussion_date,runtime,narrator,publisher,isbn'
        )
        .eq('slug', id)
        .single()

      if (bookError) {
        setError('Unable to load this book. Please try again later.')
        setLoading(false)
        return
      }

      if (!book) {
        setError('Book not found. Please select another title.')
        setLoading(false)
        return
      }

      const bookId = book.id

      const [quoteResult, meetingResult, relatedResult, memberStatusResult, membersResult] = await Promise.all([
        supabase.from('quotes').select('quote,page,member_id').eq('book_id', bookId),
        supabase
          .from('discussion_meetings')
          .select('scheduled_for,notes,location,meeting_link')
          .eq('book_id', bookId),
        supabase
          .from('books')
          .select('title,author,genre,summary,family_rating,progress,discussion_date,runtime,slug')
          .neq('id', bookId)
          .eq('genre', book.genre)
          .limit(4),
        supabase
          .from('member_book_status')
          .select('member_id,finished,updated_at')
          .eq('book_id', bookId),
        supabase.from('family_members').select('id,name'),
      ])

      const quoteRows = quoteResult.data ?? []
      const meetings = meetingResult.data ?? []
      const relatedBooksRows = relatedResult.data ?? []
      const memberStatuses = memberStatusResult.data ?? []
      const members = membersResult.data ?? []
      const memberMap = new Map((members as any[]).map((member: any) => [member.id, member.name]))

      setCurrentBook({
        title: book.title,
        author: book.author,
        rating: formatRating(book.family_rating),
        genre: book.genre ?? '',
        startedDate: formatDate(book.started_date),
        finishedDate: formatDate(book.completed_date),
        discussionDate: formatDate(book.discussion_date),
        progress: Number(book.progress ?? 0),
        summary: book.summary ?? '',
        length: formatRuntime(book.runtime),
        narrator: book.narrator ?? '',
        familyRating: book.family_rating ? book.family_rating.toFixed(1) : '',
      })

      setProgressInfo({
        complete: Number(book.progress ?? 0),
        lastListened: formatDate(book.discussion_date),
        timeRemaining:
          book.runtime && book.progress
            ? `${Math.max(0, Math.round(((book.runtime * (100 - book.progress)) / 100) / 60))} hr`
            : 'Unknown',
      })

      setQuotes(
        (quoteRows as any[]).map((quote: any) => ({
          text: quote.quote,
          source: `— ${memberMap.get(quote.member_id) ?? 'Family member'}`,
        }))
      )

      setDiscussionNote(
        meetings.length > 0
          ? {
              title: 'Discussion notes',
              blocks: [
                { type: 'heading', text: 'Upcoming meeting' },
                {
                  type: 'paragraph',
                  text: meetings[0].notes || 'A great moment to reflect on the story together.',
                },
                {
                  type: 'list',
                  text: [
                    `Scheduled for ${formatDate(meetings[0].scheduled_for)}`,
                    meetings[0].location ? `Location: ${meetings[0].location}` : 'Location TBD',
                    meetings[0].meeting_link ? `Link: ${meetings[0].meeting_link}` : 'Link not set yet',
                  ],
                },
              ],
            }
          : {
              title: 'Discussion notes',
              blocks: [
                { type: 'paragraph', text: 'No discussion meeting has been scheduled yet. Check back after your next session.' },
              ],
            }
      )

      setPhotos([
        { id: `cover-${book.slug}` },
        { id: `discussion-${book.id}` },
        { id: `member-${book.id}` },
        { id: `note-${book.id}` },
      ])

      setFacts({
        author: book.author ?? 'Unknown',
        narrator: book.narrator ?? 'Unknown narrator',
        publisher: book.publisher ?? 'Unknown publisher',
        runtime: formatRuntime(book.runtime),
        genre: book.genre ?? 'Unknown',
        releaseYear: book.completed_date ? new Date(book.completed_date).getFullYear().toString() : 'N/A',
        isbn: book.isbn ?? 'N/A',
      })

      setParticipantsCount(members.length)
      setRecommendedBy(members.length > 0 ? 'Family' : 'Unknown')

      setRelatedBooks(
        (relatedBooksRows as any[]).map((related: any) => ({
          title: related.title,
          author: related.author,
          rating: formatRating(related.family_rating),
          readingTime: formatRuntime(related.runtime),
          discussionDate: formatDate(related.discussion_date),
          description: related.summary ?? 'A similar story from your shelf.',
          slug: related.slug,
        }))
      )

      const finishedMemberNames = (memberStatuses as any[])
        .filter((status) => status.finished)
        .map((status) => memberMap.get(status.member_id) ?? 'Family member')

      setRatings(
        finishedMemberNames.length > 0
          ? finishedMemberNames.map((name) => ({
              name,
              initial: name.slice(0, 1),
              rating: formatRating(book.family_rating),
              review: `Loved ${book.title} as a ${book.genre?.toLowerCase()} adventure with the family.`,
            }))
          : []
      )

      setJourneyItems(
        meetings.length > 0
          ? (meetings as any[]).map((meeting) => ({
              year: meeting.scheduled_for ? new Date(meeting.scheduled_for).getFullYear().toString() : 'Upcoming',
              title: book.title,
              discussionDate: formatDate(meeting.scheduled_for),
              notes: meeting.notes ?? 'A family discussion is planned around this book.',
              rating: formatRating(book.family_rating),
            }))
          : []
      )

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
            {ratings.length === 0 ? (
              <p className="empty-state">No ratings have been added yet.</p>
            ) : (
              <div className="ratings-grid">
                {ratings.map((review) => (
                  <RatingCard key={review.name} review={review} />
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="quotes-section">
          <div className="section-trailer">
            <p className="eyebrow">Favourite quotes</p>
            <h2>Lines we want to remember.</h2>
          </div>
          {quotes.length === 0 ? (
            <p className="empty-state">No quotes have been saved for this title yet.</p>
          ) : (
            <div className="quotes-grid">
              {quotes.map((quote) => (
                <QuoteCard key={quote.text} quote={quote} />
              ))}
            </div>
          )}
        </section>

        {discussionNote && <DiscussionCard note={discussionNote} />}

        <section className="video-section">
          <div className="section-trailer">
            <p className="eyebrow">Video discussion</p>
            <h2>Family Discussion • {currentBook.discussionDate}</h2>
          </div>
          <div className="video-card" aria-hidden="true">
            <div className="video-thumbnail">
              <span>Video thumbnail</span>
            </div>
          </div>
        </section>

        <PhotoGallery photos={photos} />

        <div className="details-and-related">
          {facts && <BookFacts facts={facts} />}
          <RelatedBooks books={relatedBooks} />
        </div>

        <ReadingTimeline items={journeyItems} />

        <footer className="book-detail-footer">
          <p className="eyebrow">When we listened</p>
          <div className="footer-grid">
            <div>
              <p className="footer-label">Date started</p>
              <p>{currentBook.startedDate}</p>
            </div>
            <div>
              <p className="footer-label">Date finished</p>
              <p>{currentBook.finishedDate}</p>
            </div>
            <div>
              <p className="footer-label">Recommended by</p>
              <p>{recommendedBy}</p>
            </div>
            <div>
              <p className="footer-label">Participants</p>
              <p>{participantsCount > 0 ? `${participantsCount} family members` : 'No participants listed'}</p>
            </div>
          </div>
        </footer>
      </article>
    </AppShell>
  )
}
