import { useEffect, useState } from 'react'
import { Clock3, Heart, Sparkles } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { StatsCard } from '../components/stats/StatsCard'
import { supabase } from '../lib/supabase'
import type { ReactNode } from 'react'

type StatItem = {
  icon: ReactNode
  label: string
  value: string
}

function topValue(items: Array<string | null | undefined>) {
  const counts = items.reduce<Record<string, number>>((acc, value) => {
    if (!value) return acc
    acc[value] = (acc[value] ?? 0) + 1
    return acc
  }, {})
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Unknown'
}

export function StatsPage() {
  const [stats, setStats] = useState<StatItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('books')
        .select('author,genre,status,runtime')

      if (error) {
        setError('Unable to load statistics from Supabase.')
        setLoading(false)
        return
      }

      const books = data ?? []
      const completedBooks = books.filter((book: any) => book.status === 'completed').length
      const totalHours = Math.round(
        books.reduce((sum: number, book: any) => sum + Number(book.runtime ?? 0), 0) / 60,
      )
      const favoriteAuthor = topValue((books as any[]).map((book: any) => book.author))
      const topGenre = topValue((books as any[]).map((book: any) => book.genre))

      setStats([
        { icon: <Sparkles size={20} />, label: 'Completed book count', value: `${completedBooks}` },
        { icon: <Clock3 size={20} />, label: 'Total listening hours', value: `${totalHours}` },
        { icon: <Heart size={20} />, label: 'Most listened author', value: favoriteAuthor },
        { icon: <Sparkles size={20} />, label: 'Leading genre', value: topGenre },
      ])
      setLoading(false)
    }

    loadStats()
  }, [])

  return (
    <AppShell>
      <section className="page-section">
        <header className="page-header">
          <p className="eyebrow">Stats</p>
          <h1>Audio listening metrics for the family.</h1>
          <p className="intro-text">A measured, thoughtful look at what we’ve shared and what’s coming next.</p>
        </header>

        {loading ? (
          <p>Loading statistics...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : stats.length === 0 ? (
          <p className="empty-state">No statistics are available yet. Add books to see these metrics.</p>
        ) : (
          <div className="stats-grid">
            {stats.map((stat) => (
              <StatsCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  )
}
