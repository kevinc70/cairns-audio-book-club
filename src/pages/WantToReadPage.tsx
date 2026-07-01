import { useEffect, useState } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { supabase } from '../lib/supabase'

type MemberStatusRow = {
  memberId: string
  name: string
  libraryName?: string | null
  available: boolean
  onHold: boolean
  borrowed: boolean
  ownCopy: boolean
  notInterested: boolean
  holdPosition?: number | null
  expectedAvailableDate?: string | null
}

type WantBook = {
  id: string
  slug?: string
  title: string
  author?: string
  genre?: string
  familyRating?: string
  coverUrl?: string
  members: MemberStatusRow[]
}

function libbyStatus(row: MemberStatusRow) {
  if (row.ownCopy) return 'Own Copy'
  if (row.notInterested) return 'Not Interested'
  if (row.available) return 'Available'
  if (row.borrowed) return 'Borrowed'
  if (row.onHold) return 'On Hold'
  return 'Not Available'
}

export function WantToReadPage() {
  const [books, setBooks] = useState<WantBook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('id,slug,title,author,genre,cover_url,family_rating')
        .eq('status', 'want_to_read')
        .order('title', { ascending: true })

      if (booksError) {
        setError('Unable to load wish list books from Supabase.')
        setLoading(false)
        return
      }

      const bookRows = (booksData ?? []) as any[]
      if (bookRows.length === 0) {
        setBooks([])
        setLoading(false)
        return
      }

      const { data: membersData, error: membersError } = await supabase.from('family_members').select('id,name')
      if (membersError) {
        setError('Unable to load family members from Supabase.')
        setLoading(false)
        return
      }

      const memberRows = (membersData ?? []) as any[]

      const bookIds = bookRows.map((b) => b.id)
      const { data: statusesData, error: statusesError } = await supabase
        .from('member_book_status')
        .select('member_id,book_id,library_name,available,on_hold,wait_weeks,borrowed,own_copy,not_interested,hold_position,expected_available_date')
        .in('book_id', bookIds)

      if (statusesError) {
        setError('Unable to load member statuses from Supabase.')
        setLoading(false)
        return
      }

      const statuses = (statusesData ?? []) as any[]

      const result: WantBook[] = bookRows.map((b) => ({
        id: b.id,
        slug: b.slug,
        title: b.title,
        author: b.author,
        genre: b.genre,
        familyRating: b.family_rating ? `${Number(b.family_rating).toFixed(1)} ★` : '',
        coverUrl: b.cover_url,
        members: memberRows.map((m) => {
          const s = statuses.find((ss) => ss.book_id === b.id && ss.member_id === m.id)
          return {
            memberId: m.id,
            name: m.name,
            libraryName: s?.library_name ?? null,
            available: !!s?.available,
            onHold: !!s?.on_hold,
            borrowed: !!s?.borrowed,
            ownCopy: !!s?.own_copy,
            notInterested: !!s?.not_interested,
            holdPosition: s?.hold_position ?? s?.wait_weeks ?? null,
            expectedAvailableDate: s?.expected_available_date ?? null,
          } as MemberStatusRow
        }),
      }))

      setBooks(result)
      setLoading(false)
    }

    load()
  }, [])

  return (
    <AppShell>
      <section className="page-section">
        <header className="page-header">
          <p className="eyebrow">Want to Read</p>
          <h1>Curious titles waiting on our list.</h1>
          <p className="intro-text">A gentle collection of upcoming family listens and future adventures.</p>
        </header>

        {loading ? (
          <p>Loading wish list...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : books.length === 0 ? (
          <p>No books in the queue yet.</p>
        ) : (
          <div className="want-list-grid">
            {books.map((book) => (
              <article key={book.id} className="want-book-card">
                <div className="want-book-meta">
                  <div className="cover">
                    {book.coverUrl ? <img src={book.coverUrl} alt={`${book.title} cover`} /> : <div className="book-cover-placeholder">Cover</div>}
                  </div>
                  <div className="info">
                    <h3>{book.title}</h3>
                    <p className="book-author">{book.author}</p>
                    <p className="book-genre">{book.genre}</p>
                    <p className="book-rating">{book.familyRating}</p>
                  </div>
                </div>

                <table className="member-status-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Libby status</th>
                      <th>Hold position</th>
                      <th>Expected availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {book.members.map((m) => (
                      <tr key={m.memberId}>
                        <td>{m.name}</td>
                        <td>{libbyStatus(m)}{m.libraryName ? ` · ${m.libraryName}` : ''}</td>
                        <td>{m.holdPosition ?? '-'}</td>
                        <td>{m.expectedAvailableDate ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  )
}
