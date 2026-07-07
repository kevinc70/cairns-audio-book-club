import { useEffect, useState } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { FinishedBooks } from '../components/books/FinishedBooks'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import { supabase } from '../lib/supabase'
import type { FinishedBook } from '../types'

function formatDate(date: string | null | undefined) {
  if (!date) return 'TBD'
  const dateOnlyMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  const parsed = dateOnlyMatch
    ? new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]))
    : new Date(date)
  if (Number.isNaN(parsed.getTime())) return 'TBD'
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function CompletedPage() {
  const [books, setBooks] = useState<FinishedBook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('books')
        .select('title,author,discussion_date,genre,family_rating,summary,slug,cover_url,cover_image_url')
        .eq('status', 'completed')
        .order('discussion_date', { ascending: false })

      if (error) {
        setError('Unable to load completed books from Supabase.')
        setLoading(false)
        return
      }

      const sortedBooks = (data ?? []).slice().sort((a: any, b: any) => {
        if (!a.discussion_date && !b.discussion_date) return 0
        if (!a.discussion_date) return 1
        if (!b.discussion_date) return -1
        return new Date(b.discussion_date).getTime() - new Date(a.discussion_date).getTime()
      })

      setBooks(
        sortedBooks.map((book: any) => ({
          title: book.title,
          author: book.author,
          discussionDate: formatDate(book.discussion_date),
          rating: book.family_rating ? `${book.family_rating.toFixed(1)} ★` : '',
          quote: book.summary ?? '',
          slug: book.slug,
          coverUrl: book.cover_image_url ?? book.cover_url ?? '',
        })),
      )
      setLoading(false)
    }

    loadBooks()
  }, [])

  return (
    <AppShell>
      <section className="page-section">
        <header className="page-header">
          <p className="eyebrow">Completed</p>
          <h1>Stories our family has finished together.</h1>
          <p className="intro-text">A growing collection of completed audiobooks from the Supabase library.</p>
        </header>
        {loading ? (
          <LoadingScreen message="Turning the page..." />
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : (
          <FinishedBooks books={books} />
        )}
      </section>
    </AppShell>
  )
}
