import { useState } from 'react'
import { LoadingScreen } from '../ui/LoadingScreen'
import { StatusFilterDropdown } from '../ui/StatusFilterDropdown'
import { supabase } from '../../lib/supabase'
import type { ShelfBook } from '../../types'

interface AddBookModalProps {
  open: boolean
  onClose: () => void
  onSaved: (book: ShelfBook) => void
}

type BookStatus = 'want_to_read' | 'upcoming' | 'current' | 'completed'

const BOOK_STATUS_OPTIONS: Array<{ value: BookStatus; label: string }> = [
  { value: 'want_to_read', label: 'Want to Read' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'current', label: 'Reading' },
  { value: 'completed', label: 'Finished' },
]

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
}

export default function AddBookModal({ open, onClose, onSaved }: AddBookModalProps) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [status, setStatus] = useState<BookStatus>('want_to_read')
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (!open) return null

  const handleSave = async () => {
    const t = title.trim()
    const a = author.trim()
    if (!t || !a) {
      setErrorMessage('Please provide both Book Title and Author.')
      return
    }

    setErrorMessage('')
    setSaving(true)

    try {
      const slugBase = slugify(t)
      const slug = `${slugBase}-${Date.now().toString().slice(-4)}`

      const payload: any = {
        title: t,
        author: a,
        cover_image_url: coverImageUrl?.trim() ? coverImageUrl.trim() : null,
        status,
        slug,
      }

      const { data: inserted, error: insertError } = await supabase.from('books').insert([payload]).select()
      if (insertError || !inserted || inserted.length === 0) {
        const message = insertError?.message || 'Unknown insert error'
        const details = insertError?.details ? `: ${insertError.details}` : ''
        const fullMessage = `${message}${details}`
        setErrorMessage(fullMessage)
        console.error('Failed to insert book', insertError)
        setSaving(false)
        return
      }

      const bookRow: any = inserted[0]
      const shelfBook: ShelfBook = {
        title: bookRow.title,
        author: bookRow.author,
        rating: '',
        readingTime: '',
        discussionDate: '',
        description: bookRow.summary ?? '',
        slug: bookRow.slug,
        coverUrl: bookRow.cover_image_url ?? '',
      }

      onSaved(shelfBook)
      onClose()
      setTitle('')
      setAuthor('')
      setCoverImageUrl('')
      setStatus('want_to_read')
    } catch (error) {
      console.error('Failed to save book', error)
      const message = error instanceof Error ? error.message : String(error)
      setErrorMessage(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop">
      {saving ? <LoadingScreen message="Saving your story..." /> : null}
      <div className="modal-card">
        <header className="modal-header">
          <h2>Add a Book</h2>
        </header>
        <div className="modal-body">
          <label className="field">
            <span className="field-label">Book Title *</span>
            <input placeholder="Book title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>

          <label className="field">
            <span className="field-label">Author *</span>
            <input placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </label>

          <label className="field">
            <span className="field-label">Cover image URL</span>
            <input placeholder="https://...jpg (optional)" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} />
          </label>

          <StatusFilterDropdown
            label="Status"
            value={status}
            options={BOOK_STATUS_OPTIONS}
            onChange={setStatus}
          />

          {errorMessage && <p className="error-text">{errorMessage}</p>}
        </div>
        <footer className="modal-footer">
          <button onClick={onClose} className="btn" type="button">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary" type="button" disabled={saving || !title.trim() || !author.trim()}>
            {saving ? 'Saving…' : 'Save Book'}
          </button>
        </footer>
      </div>
    </div>
  )
}
