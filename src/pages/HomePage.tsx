import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { BookCarousel, type BookCarouselItem } from '../components/books/BookCarousel'
import { FamilyGrid } from '../components/books/FamilyGrid'
import AddBookModal from '../components/books/AddBookModal'
import { FinishedBooks } from '../components/books/FinishedBooks'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import { StatusFilterDropdown } from '../components/ui/StatusFilterDropdown'
import { deleteBookAndChildren } from '../lib/deleteBook'
import { supabase } from '../lib/supabase'
import type { Member, FinishedBook } from '../types'

type AdminBookRow = {
  id: string
  title: string
  author?: string
  status: string
  discussionDate: string | null
  slug?: string
}

type StatusFilter = 'all' | 'want_to_read' | 'upcoming' | 'current' | 'completed'
type SortConfig = { key: 'title' | 'discussionDate'; direction: 'asc' | 'desc' } | null

const STATUS_FILTER_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'want_to_read', label: 'Want to Read' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'current', label: 'Reading' },
  { value: 'completed', label: 'Finished' },
]

function formatDate(date: string | null | undefined) {
  if (!date) return 'TBD'
  const dateOnlyMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  const parsed = dateOnlyMatch
    ? new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]))
    : new Date(date)
  if (Number.isNaN(parsed.getTime())) return 'TBD'
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function statusGroup(status: string | null | undefined): StatusFilter {
  const normalized = (status ?? '').toLowerCase().replaceAll(' ', '_')
  if (normalized === 'want_to_read') return 'want_to_read'
  if (normalized === 'upcoming') return 'upcoming'
  if (normalized === 'reading' || normalized === 'current') return 'current'
  if (normalized === 'finished' || normalized === 'completed') return 'completed'
  return 'all'
}

function statusLabel(status: string | null | undefined) {
  const group = statusGroup(status)
  if (group === 'want_to_read') return 'Want to Read'
  if (group === 'upcoming') return 'Upcoming'
  if (group === 'current') return 'Reading'
  if (group === 'completed') return 'Finished'
  return status || 'Unknown'
}

function dateTime(date: string | null | undefined) {
  if (!date) return null
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime()
}

type CurrentReadingBook = {
  id: string
  title: string
  author?: string
  discussion_date?: string | null
  cover_url?: string | null
  cover_image_url?: string | null
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

function memberInitial(name: string | null | undefined) {
  if (name === 'Kevin') return 'K'
  if (name === 'Bel') return 'B'
  if (name === 'Angus') return 'A'
  return name?.slice(0, 1) ?? ''
}

function availabilityText(status: any) {
  if (!status) return '—'
  if (status.available) return 'Available Now'
  if (status.expected_available_date) return formatDate(status.expected_available_date)
  return '—'
}

function earliestAvailabilityValue(statuses: any[]) {
  if (statuses.some((status) => status.available)) return 0
  const times = statuses
    .map((status) => dateTime(status.expected_available_date))
    .filter((time): time is number => time !== null)
  return times.length > 0 ? Math.min(...times) : Number.POSITIVE_INFINITY
}

export function HomePage() {
  const [currentReadingBook, setCurrentReadingBook] = useState<CurrentReadingBook | null>(null)
  const [familyMembers, setFamilyMembers] = useState<Member[]>([])
  const [schedulingBooks, setSchedulingBooks] = useState<BookCarouselItem[]>([])
  const [upcomingBooks, setUpcomingBooks] = useState<FinishedBook[]>([])
  const [finishedBooks, setFinishedBooks] = useState<FinishedBook[]>([])
  const [adminBooks, setAdminBooks] = useState<AdminBookRow[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const [adminError, setAdminError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAdminBooks = async () => {
    const { data, error } = await supabase
      .from('books')
      .select('id,title,author,status,discussion_date,slug')
      .order('title', { ascending: true })

    if (error) {
      setAdminError('Unable to refresh library books from Supabase.')
      return
    }

    setAdminError('')
    setAdminBooks(
      (data ?? []).map((book: any) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        status: book.status,
        discussionDate: book.discussion_date ?? null,
        slug: book.slug,
      })),
    )
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)

      const [
        { data: books, error: booksError },
        { data: members, error: membersError },
        { data: statuses, error: statusesError },
        { data: readingBook, error: readingBookError },
      ] = await Promise.all([
        supabase
          .from('books')
          .select('id,slug,title,author,genre,summary,family_rating,status,discussion_date,cover_url,cover_image_url'),
        supabase.from('family_members').select('id,name'),
        supabase.from('member_book_status').select('member_id,book_id,finished,available,expected_available_date'),
        supabase
          .from('books')
          .select('id,title,author,discussion_date,cover_url,cover_image_url')
          .in('status', ['Reading', 'current'])
          .limit(1)
          .maybeSingle(),
      ])

      if (booksError || membersError || statusesError || readingBookError) {
        setError('Unable to load library data from Supabase.')
        setLoading(false)
        return
      }

      const booksList = books ?? []
      const membersList = members ?? []
      const statusList = statuses ?? []
      const bookById = new Map((booksList as any[]).map((book: any) => [book.id, book]))

      const memberRows = (membersList as any[]).map((member: any) => {
        const memberStatuses = (statusList as any[]).filter((status: any) => status.member_id === member.id)
        const completedCount = memberStatuses.filter((status: any) => status.finished).length
        const currentStatus = memberStatuses.find((status: any) => !status.finished)
        const currentBook = currentStatus ? bookById.get(currentStatus.book_id) : null
        const genres = memberStatuses.map((status: any) => bookById.get(status.book_id)?.genre).filter(Boolean)

        return {
          id: member.id,
          name: member.name,
          initial: member.name?.slice(0, 1) ?? '',
          booksCompleted: completedCount,
          favoriteGenre: topGenre(genres),
          currentlyListening: currentBook?.title ?? '',
        }
      })

      const finishedBooksList = (booksList as any[])
        .filter((book: any) => statusGroup(book.status) === 'completed')
        .sort((a: any, b: any) => {
          if (!a.discussion_date && !b.discussion_date) return 0
          if (!a.discussion_date) return 1
          if (!b.discussion_date) return -1
          return new Date(b.discussion_date).getTime() - new Date(a.discussion_date).getTime()
        })
        .map((book: any) => ({
          title: book.title,
          author: book.author,
          discussionDate: formatDate(book.discussion_date),
          rating: formatRating(book.family_rating),
          quote: book.summary ?? '',
          slug: book.slug,
          coverUrl: book.cover_image_url ?? book.cover_url ?? '',
        }))

      const schedulingBooksList = (booksList as any[])
        .filter((book: any) => statusGroup(book.status) === 'want_to_read')
        .map((book: any) => {
          const bookStatuses = (statusList as any[]).filter((status: any) => status.book_id === book.id)
          const metaLines = ['Expected Availability', ...['Kevin', 'Bel', 'Angus'].map((name) => {
            const member = (membersList as any[]).find((item: any) => item.name === name)
            const status = member ? bookStatuses.find((item: any) => item.member_id === member.id) : null
            return `${memberInitial(name)}: ${availabilityText(status)}`
          })]

          return {
            title: book.title,
            author: book.author,
            slug: book.slug,
            coverUrl: book.cover_image_url ?? book.cover_url ?? '',
            metaLines,
            sortValue: earliestAvailabilityValue(bookStatuses),
          }
        })
        .sort((a: any, b: any) => a.sortValue - b.sortValue || a.title.localeCompare(b.title))
        .map(({ sortValue, ...book }: any) => book)

      const upcomingBooksList = (booksList as any[])
        .filter((book: any) => statusGroup(book.status) === 'upcoming')
        .sort((a: any, b: any) => new Date(a.discussion_date).getTime() - new Date(b.discussion_date).getTime())
        .map((book: any) => ({
          title: book.title,
          author: book.author,
          discussionDate: formatDate(book.discussion_date),
          rating: '',
          quote: '',
          slug: book.slug,
          coverUrl: book.cover_image_url ?? book.cover_url ?? '',
        }))

      setFamilyMembers(memberRows)
      setSchedulingBooks(schedulingBooksList)
      setUpcomingBooks(upcomingBooksList)
      setFinishedBooks(finishedBooksList)
      setAdminBooks((booksList as any[]).map((book: any) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        status: book.status,
        discussionDate: book.discussion_date ?? null,
        slug: book.slug,
      })))
      setCurrentReadingBook(readingBook ?? null)
      setLoading(false)
    }

    loadData()
  }, [])

  const visibleAdminBooks = useMemo(() => {
    const filtered = adminBooks.filter((book) =>
      statusFilter === 'all' ? true : statusGroup(book.status) === statusFilter,
    )

    if (!sortConfig) return filtered

    return filtered.slice().sort((a, b) => {
      if (sortConfig.key === 'title') {
        const result = a.title.localeCompare(b.title)
        return sortConfig.direction === 'asc' ? result : -result
      }

      const aTime = dateTime(a.discussionDate)
      const bTime = dateTime(b.discussionDate)
      if (aTime === null && bTime === null) return 0
      if (aTime === null) return 1
      if (bTime === null) return -1
      return sortConfig.direction === 'asc' ? aTime - bTime : bTime - aTime
    })
  }, [adminBooks, sortConfig, statusFilter])

  const toggleSort = (key: 'title' | 'discussionDate') => {
    setSortConfig((current) => {
      if (key === 'title') {
        return current?.key === 'title' && current.direction === 'asc'
          ? { key, direction: 'desc' }
          : { key, direction: 'asc' }
      }

      return current?.key === 'discussionDate' && current.direction === 'desc'
        ? { key, direction: 'asc' }
        : { key, direction: 'desc' }
    })
  }

  const handleDeleteBook = async (book: AdminBookRow) => {
    const confirmed = window.confirm(
      `Delete '${book.title}'? This will also delete all member status records, discussion links, notes, and photos associated with this book.`,
    )
    if (!confirmed) return

    setDeleting(true)
    setAdminError('')

    try {
      await deleteBookAndChildren(book.id)
      await loadAdminBooks()
    } catch (deleteError) {
      console.error('Failed to delete book', deleteError)
      setAdminError(deleteError instanceof Error ? deleteError.message : 'Unable to delete this book.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <AppShell>
        <LoadingScreen message="Turning the page..." />
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
      {deleting ? <LoadingScreen message="Closing the book..." /> : null}
      <div className="home-page">
      <section className="section-block current-reading-hero">
        <p className="current-reading-label">BOOK WE'RE READING</p>
        {currentReadingBook ? (
          <div className="current-reading-row">
            <div className="current-reading-cover-wrap">
              {currentReadingBook.cover_image_url || currentReadingBook.cover_url ? (
                <img
                  src={currentReadingBook.cover_image_url ?? currentReadingBook.cover_url ?? ''}
                  alt={currentReadingBook.title}
                  className="current-book-cover"
                />
              ) : (
                <div className="current-book-cover current-book-cover-placeholder" aria-hidden="true">
                  <span>Book cover</span>
                </div>
              )}
            </div>
            <div className="current-reading-copy">
              <h2>{currentReadingBook.title}</h2>
              <p className="hero-author">{currentReadingBook.author}</p>
              {currentReadingBook.discussion_date ? (
                <p className="current-reading-discussion">
                  Discussion: {formatDate(currentReadingBook.discussion_date)}
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="current-reading-empty">
            <p>No book is currently being read.</p>
          </div>
        )}
      </section>

      <BookCarousel
        label="Scheduling"
        title="Scheduling"
        books={schedulingBooks}
        emptyMessage="No books are waiting to be scheduled yet."
        linkWholeCard
      />

      <BookCarousel
        label="Upcoming"
        title="Upcoming"
        books={upcomingBooks}
        emptyMessage="No upcoming discussions are scheduled yet."
        linkWholeCard
      />

      <FinishedBooks books={finishedBooks} />

      <section className="section-block admin-library-section">
        <div className="section-trailer">
          <p className="eyebrow">Library Management</p>
          <h2>Manage books, status, and discussion dates.</h2>
        </div>

        <div className="library-management-actions">
          <button className="btn btn-primary" type="button" onClick={() => setShowAddModal(true)}>
            + Add Book
          </button>
        </div>

        <div className="library-management-controls">
          <StatusFilterDropdown
            label="Status"
            value={statusFilter}
            options={STATUS_FILTER_OPTIONS}
            onChange={setStatusFilter}
          />
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <button className="table-sort-button" type="button" onClick={() => toggleSort('title')}>
                    Title {sortConfig?.key === 'title' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </button>
                </th>
                <th>Author</th>
                <th>Status</th>
                <th>
                  <button className="table-sort-button" type="button" onClick={() => toggleSort('discussionDate')}>
                    Discussion Date {sortConfig?.key === 'discussionDate' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </button>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleAdminBooks.map((book) => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author ?? '-'}</td>
                  <td>{statusLabel(book.status)}</td>
                  <td>{formatDate(book.discussionDate)}</td>
                  <td>
                    <Link className="btn mobile-edit-button" to={book.slug ? `/book/${book.slug}` : '/library'}>
                      Edit
                    </Link>
                    <button
                      className="btn delete-book-button"
                      type="button"
                      onClick={() => handleDeleteBook(book)}
                      disabled={deleting}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {adminError && <p className="error-text">{adminError}</p>}

        <AddBookModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSaved={() => {
            loadAdminBooks()
          }}
        />
      </section>

      <FamilyGrid members={familyMembers} />
      </div>
    </AppShell>
  )
}
