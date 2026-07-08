import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import AddBookModal from '../components/books/AddBookModal'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import { StatusFilterDropdown } from '../components/ui/StatusFilterDropdown'
import { deleteBookAndChildren } from '../lib/deleteBook'
import { supabase } from '../lib/supabase'

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

export function LibraryPage() {
  const [books, setBooks] = useState<AdminBookRow[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadBooks = async () => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('books')
      .select('id,title,author,status,discussion_date,slug')
      .order('title', { ascending: true })

    if (error) {
      setError('Unable to load library books from Supabase.')
      setLoading(false)
      return
    }

    setBooks(
      (data ?? []).map((book: any) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        status: book.status,
        discussionDate: book.discussion_date ?? null,
        slug: book.slug,
      })),
    )
    setLoading(false)
  }

  useEffect(() => {
    loadBooks()
  }, [])

  const visibleBooks = useMemo(() => {
    const filtered = books.filter((book) =>
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
  }, [books, sortConfig, statusFilter])

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
    setError(null)

    try {
      await deleteBookAndChildren(book.id)
      await loadBooks()
    } catch (deleteError) {
      console.error('Failed to delete book', deleteError)
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete this book.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AppShell>
      {deleting ? <LoadingScreen message="Closing the book..." /> : null}
      <section className="page-section admin-library-section">
        <header className="page-header">
          <p className="eyebrow">Library Management</p>
          <h1>Manage books, status, and discussion dates.</h1>
        </header>

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

        {loading ? (
          <LoadingScreen message="Turning the page..." />
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : (
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
                  <th>Actions</th>
                  <th>
                    <button className="table-sort-button" type="button" onClick={() => toggleSort('discussionDate')}>
                      Discussion Date {sortConfig?.key === 'discussionDate' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleBooks.map((book) => (
                  <tr key={book.id}>
                    <td>{book.title}</td>
                    <td>{book.author ?? '-'}</td>
                    <td>{statusLabel(book.status)}</td>
                    <td>
                      <Link className="btn" to={book.slug ? `/book/${book.slug}` : '/library'}>
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
                    <td>{formatDate(book.discussionDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AddBookModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSaved={() => {
            loadBooks()
          }}
        />
      </section>
    </AppShell>
  )
}
