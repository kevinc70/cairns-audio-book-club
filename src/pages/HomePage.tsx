import { useEffect, useState } from 'react'
import { BookOpen, Clock3, Heart, Sparkles } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { HeroSection } from '../components/ui/HeroSection'
import { FamilyGrid } from '../components/books/FamilyGrid'
import BookCoverList from '../components/books/BookCoverList'
import { FinishedBooks } from '../components/books/FinishedBooks'
import { ReadingTimeline } from '../components/books/ReadingTimeline'
import { ActivityFeed } from '../components/books/ActivityFeed'
import { StatsCard } from '../components/stats/StatsCard'
import { supabase } from '../lib/supabase'
import type { Member, ShelfBook, FinishedBook, JourneyItem, ActivityItem, HeroBook } from '../types'
import type { ReactNode } from 'react'

type StatItem = {
  icon: ReactNode
  label: string
  value: string
}

const emptyStats: StatItem[] = []

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
  if (!familyRating && familyRating !== 0) return ''
  return `${familyRating.toFixed(1)} ★`
}

function topGenre(genres: Array<string | null | undefined>) {
  const counts = genres.reduce<Record<string, number>>((acc, genre) => {
    if (!genre) return acc
    acc[genre] = (acc[genre] ?? 0) + 1
    return acc
  }, {})

  const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return winner?.[0] ?? ''
}

export function HomePage() {
  const [currentBook, setCurrentBook] = useState<HeroBook | null>(null)
  const [familyMembers, setFamilyMembers] = useState<Member[]>([])
  const [nextAdventures, setNextAdventures] = useState<ShelfBook[]>([])
  const [finishedBooks, setFinishedBooks] = useState<FinishedBook[]>([])
  const [journeyItems, setJourneyItems] = useState<JourneyItem[]>([])
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([])
  const [stats, setStats] = useState<StatItem[]>(emptyStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)

      const [{ data: books, error: booksError }, { data: members, error: membersError }, { data: statuses, error: statusesError }] =
        await Promise.all([
          supabase
            .from('books')
            .select('id,slug,title,author,genre,summary,family_rating,progress,status,started_date,completed_date,discussion_date,runtime')
            .order('discussion_date', { ascending: true }),
          supabase.from('family_members').select('id,name'),
          supabase.from('member_book_status').select('member_id,book_id,finished,updated_at'),
        ])

      if (booksError || membersError || statusesError) {
        setError('Unable to load library data from Supabase.')
        setLoading(false)
        return
      }

      const booksList = books ?? []
      const membersList = members ?? []
      const statusList = statuses ?? []
      const bookById = new Map((booksList as any[]).map((book: any) => [book.id, book]))

      const featuredBook =
        (booksList as any[]).find((book: any) => book.status === 'current') ??
        (booksList as any[]).find((book: any) => book.status !== 'want_to_read') ??
        booksList[0]
      if (featuredBook) {
        setCurrentBook({
          title: featuredBook.title,
          author: featuredBook.author,
          rating: formatRating(featuredBook.family_rating),
          startedDate: formatDate(featuredBook.started_date),
          discussionDate: formatDate(featuredBook.discussion_date),
          progress: Number(featuredBook.progress ?? 0),
          summary: featuredBook.summary ?? '',
          genre: featuredBook.genre ?? '',
          length: formatRuntime(featuredBook.runtime),
          narrator: featuredBook.narrator ?? '',
          finishedDate: formatDate(featuredBook.completed_date),
          familyRating: featuredBook.family_rating ? featuredBook.family_rating.toFixed(1) : '',
        })
      }

      const memberRows = (membersList as any[]).map((member: any) => {
        const memberStatuses = (statusList as any[]).filter((status: any) => status.member_id === member.id)
        const completedCount = memberStatuses.filter((status: any) => status.finished).length
        const currentStatus = memberStatuses.find((status: any) => !status.finished)
        const currentBook = currentStatus ? bookById.get(currentStatus.book_id) : null
        const genres = memberStatuses.map((status: any) => bookById.get(status.book_id)?.genre).filter(Boolean)

        return {
          name: member.name,
          initial: member.name?.slice(0, 1) ?? '',
          booksCompleted: completedCount,
          favoriteGenre: topGenre(genres),
          currentlyListening: currentBook?.title ?? '',
        }
      })

      const nextBooks = (booksList as any[])
        .filter((book: any) => book.status === 'want_to_read')
        .slice(0, 3)
        .map((book: any) => ({
          title: book.title,
          author: book.author,
          rating: formatRating(book.family_rating),
          readingTime: formatRuntime(book.runtime),
          discussionDate: formatDate(book.discussion_date),
          description: book.summary ?? '',
          slug: book.slug,
        }))

      const finishedBooksList = (booksList as any[])
        .filter((book: any) => book.status === 'completed')
        .map((book: any) => ({
          title: book.title,
          author: book.author,
          discussionDate: formatDate(book.discussion_date),
          rating: formatRating(book.family_rating),
          quote: book.summary ?? '',
          slug: book.slug,
        }))

      const timelineItems = (booksList as any[]).map((book: any) => ({
        year: book.discussion_date ? new Date(book.discussion_date).getFullYear().toString() : '',
        title: book.title,
        discussionDate: formatDate(book.discussion_date),
        notes: book.summary ?? '',
        rating: formatRating(book.family_rating),
      }))

      const recentActivity = (statusList as any[])
        .slice()
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 4)
        .map((status: any) => {
          const book = bookById.get(status.book_id)
          return {
            title: book ? `${book.title} status updated` : 'Reading status updated',
            description: book
              ? `Family progress moved to ${book.progress ?? 0}% on ${book.title}.`
              : 'A family listening update is available.',
            time: status.updated_at ? new Date(status.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent',
          }
        })

      const completedBooks = finishedBooksList.length
      const totalHours = (booksList as any[]).reduce((sum, book: any) => sum + Number(book.runtime ?? 0), 0)
      const uniqueAuthors = Array.from(new Set((booksList as any[]).map((book) => book.author).filter(Boolean)))
      const topGenreValue = topGenre((booksList as any[]).map((book) => book.genre))

      setFamilyMembers(memberRows)
      setNextAdventures(nextBooks)
      setFinishedBooks(finishedBooksList)
      setJourneyItems(timelineItems)
      setActivityItems(recentActivity)
      setStats([
        { icon: <BookOpen size={20} />, label: 'Completed books', value: `${completedBooks}` },
        { icon: <Clock3 size={20} />, label: 'Listening hours', value: `${Math.round(totalHours / 60)}` },
        { icon: <Heart size={20} />, label: 'Most frequent author', value: uniqueAuthors[0] ?? 'Unknown' },
        { icon: <Sparkles size={20} />, label: 'Leading genre', value: topGenreValue },
      ])
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <AppShell>
        <section className="page-section">
          <header className="page-header">
            <p className="eyebrow">Loading</p>
            <h1>Fetching your family library</h1>
            <p className="intro-text">Connecting to Supabase and loading live data.</p>
          </header>
        </section>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell>
        <section className="page-section">
          <header className="page-header">
            <p className="eyebrow">Connection issue</p>
            <h1>{error}</h1>
            <p className="intro-text">Please verify your Supabase credentials and try again.</p>
          </header>
        </section>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <header className="page-header page-header-premium">
        <p className="eyebrow">We’ve shared all these amazing stories together.</p>
        <h1>A home for our family’s audiobooks.</h1>
        <p className="intro-text">
          Every listen is a moment to enjoy together—stories that feel cinematic, personal, and unforgettable.
        </p>
      </header>

      {currentBook && <HeroSection book={currentBook} />}
      <FamilyGrid members={familyMembers} />

      <section className="section-block">
        <div className="section-trailer">
          <p className="eyebrow">Our Next Adventures</p>
          <h2>Large covers, strong stories, next on the shelf.</h2>
        </div>
        <BookCoverList items={nextAdventures} />
      </section>

      <FinishedBooks books={finishedBooks} />
      <ReadingTimeline items={journeyItems} />
      <ActivityFeed items={activityItems} />

      <section className="stats-section">
        <div className="section-trailer">
          <p className="eyebrow">Statistics</p>
          <h2>Elegant story metrics, not a dashboard.</h2>
        </div>
        <div className="stats-grid">
          {stats.map((stat) => (
            <StatsCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
          ))}
        </div>
      </section>
    </AppShell>
  )
}
