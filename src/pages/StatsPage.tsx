import { AppShell } from '../components/layout/AppShell'

export function StatsPage() {
  return (
    <AppShell>
      <section className="page-section">
        <header className="page-header">
          <p className="eyebrow">Stats</p>
          <h1>Audio listening metrics for the family.</h1>
          <p className="intro-text">A measured, thoughtful look at what we’ve shared and what’s coming next.</p>
        </header>
      </section>
    </AppShell>
  )
}
