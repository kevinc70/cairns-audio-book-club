import { useEffect, useState } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { FinishedBooks } from '../components/books/FinishedBooks'
import { supabase } from '../lib/supabase'
import type { FinishedBook } from '../types'

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
        .select('title,author,discussion_date,genre,family_rating,summary,slug')
        .eq('status', 'completed')
        .order('discussion_date', { ascending: false })

      if (error) {
        setError('Unable to load completed books from Supabase.')
        setLoading(false)
        return
      }

      setBooks(
        (data ?? []).map((book: any) => ({
          title: book.title,
          author: book.author,
          discussionDate: book.discussion_date ?? '',
          rating: book.family_rating ? `${book.family_rating.toFixed(1)} ★` : '',
          quote: book.summary ?? '',
          slug: book.slug,
        }))
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
          <p>Loading completed books...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : (
          <FinishedBooks books={books} />
        )}
      </section>
    </AppShell>
  )
}
