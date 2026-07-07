import { useEffect, useState } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import { supabase } from '../lib/supabase'

type MemberStatusRow = {
  memberId: string
  name: string
  available: boolean
  onHold: boolean
  borrowed: boolean
  ownCopy: boolean
  notInterested: boolean
  holdPosition?: number | null
  expectedAvailableDate?: string | null
  notes?: string | null
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

function availabilityStatus(row: MemberStatusRow) {
  if (row.available) return 'Available Now'
  if (row.onHold) return 'On Hold'
  return 'Not Available'
}

export function WantToReadPage() {
  const [books, setBooks] = useState<WantBook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingStatus, setSavingStatus] = useState<Record<string, boolean>>({})
  const [saveErrors, setSaveErrors] = useState<Record<string, string>>({})

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
      const memberNames = ['Kevin', 'Bel', 'Angus']
      const orderedMembers = memberNames
        .map((name) => memberRows.find((member) => member.name === name))
        .filter(Boolean)

      const bookIds = bookRows.map((b) => b.id)
      const { data: statusesData, error: statusesError } = await supabase
        .from('member_book_status')
        .select('member_id,book_id,available,on_hold,borrowed,own_copy,not_interested,hold_position,expected_available_date,notes')
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
        members: orderedMembers.map((m) => {
          const s = statuses.find((ss) => ss.book_id === b.id && ss.member_id === m.id)
          return {
            memberId: m.id,
            name: m.name,
            available: !!s?.available,
            onHold: !!s?.on_hold,
            borrowed: !!s?.borrowed,
            ownCopy: !!s?.own_copy,
            notInterested: !!s?.not_interested,
            holdPosition: s?.hold_position ?? null,
            expectedAvailableDate: s?.expected_available_date ?? null,
            notes: s?.notes ?? null,
          } as MemberStatusRow
        }),
      }))

      setBooks(result)
      setLoading(false)
    }

    load()
  }, [])

  const updateMember = (bookId: string, memberId: string, changes: Partial<MemberStatusRow>) => {
    setBooks((current) =>
      current.map((book) =>
        book.id !== bookId
          ? book
          : {
              ...book,
              members: book.members.map((member) => (member.memberId !== memberId ? member : { ...member, ...changes })),
            },
      ),
    )
  }

  const handleSaveStatus = async (bookId: string, member: MemberStatusRow) => {
    const key = `${bookId}-${member.memberId}`
    setSavingStatus((prev) => ({ ...prev, [key]: true }))
    setSaveErrors((prev) => ({ ...prev, [key]: '' }))

    const payload = {
      book_id: bookId,
      member_id: member.memberId,
      available: member.available,
      on_hold: member.onHold,
      borrowed: false,
      own_copy: false,
      not_interested: false,
      hold_position: member.onHold ? member.holdPosition ?? null : null,
      expected_available_date: member.onHold ? member.expectedAvailableDate || null : null,
      notes: member.notes || null,
    }

    try {
      const { data: existing, error: fetchError } = await supabase
        .from('member_book_status')
        .select('id')
        .eq('book_id', bookId)
        .eq('member_id', member.memberId)
        .maybeSingle()

      if (fetchError) {
        throw fetchError
      }

      if (existing?.id) {
        const { error: updateError } = await supabase
          .from('member_book_status')
          .update(payload)
          .eq('id', existing.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from('member_book_status').insert([payload])
        if (insertError) throw insertError
      }
    } catch (saveError) {
      console.error('Failed to save member status', saveError)
      setSaveErrors((prev) => ({
        ...prev,
        [key]: saveError instanceof Error ? saveError.message : String(saveError),
      }))
    } finally {
      setSavingStatus((prev) => ({ ...prev, [key]: false }))
    }
  }

  return (
    <AppShell>
      {Object.values(savingStatus).some(Boolean) ? <LoadingScreen message="Saving your story..." /> : null}
      <section className="page-section">
        <header className="page-header">
          <p className="eyebrow">Want to Read</p>
          <h1>Curious titles waiting on our list.</h1>
          <p className="intro-text">A gentle collection of upcoming family listens and future adventures.</p>
        </header>

        {loading ? (
          <LoadingScreen message="Turning the page..." />
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

                <div className="member-cards-grid">
                  {book.members.map((member) => {
                    const key = `${book.id}-${member.memberId}`
                    const saving = savingStatus[key] ?? false
                    const errorMessage = saveErrors[key]
                    return (
                      <section key={member.memberId} className="member-card">
                        <div className="member-card-header">
                          <h4>{member.name}</h4>
                          <span className="member-status-pill">{availabilityStatus(member)}</span>
                        </div>

                        <fieldset className="member-field member-availability">
                          <legend>Availability</legend>
                          <label>
                            <input
                              type="radio"
                              name={`available-${key}`}
                              checked={member.available}
                              onChange={() => updateMember(book.id, member.memberId, { available: true, onHold: false, holdPosition: null, expectedAvailableDate: null })}
                            />
                            Available Now
                          </label>
                          <label>
                            <input
                              type="radio"
                              name={`available-${key}`}
                              checked={member.onHold}
                              onChange={() => updateMember(book.id, member.memberId, { available: false, onHold: true })}
                            />
                            On Hold
                          </label>
                          <label>
                            <input
                              type="radio"
                              name={`available-${key}`}
                              checked={!member.available && !member.onHold}
                              onChange={() => updateMember(book.id, member.memberId, { available: false, onHold: false, holdPosition: null, expectedAvailableDate: null })}
                            />
                            Not Available
                          </label>
                        </fieldset>

                        <label className="member-field">
                          <span>Hold Position</span>
                          <input
                            type="number"
                            min="0"
                            value={member.holdPosition ?? ''}
                            disabled={!member.onHold}
                            onChange={(e) => updateMember(book.id, member.memberId, { holdPosition: e.target.value ? Number(e.target.value) : null })}
                          />
                        </label>

                        <label className="member-field">
                          <span>Expected Availability</span>
                          <input
                            type="date"
                            value={member.expectedAvailableDate ?? ''}
                            disabled={!member.onHold}
                            onChange={(e) => updateMember(book.id, member.memberId, { expectedAvailableDate: e.target.value || null })}
                          />
                        </label>

                        <label className="member-field">
                          <span>Notes</span>
                          <textarea
                            value={member.notes ?? ''}
                            onChange={(e) => updateMember(book.id, member.memberId, { notes: e.target.value || null })}
                          />
                        </label>

                        <button
                          className="btn btn-secondary"
                          type="button"
                          disabled={saving}
                          onClick={() => handleSaveStatus(book.id, member)}
                        >
                          {saving ? `Saving ${member.name}…` : `Save ${member.name} Status`}
                        </button>
                        {errorMessage && <p className="error-text">{errorMessage}</p>}
                      </section>
                    )
                  })}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  )
}
