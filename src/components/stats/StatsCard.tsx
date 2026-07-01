import type { ReactNode } from 'react'

interface StatsCardProps {
  icon: ReactNode
  label: string
  value: string
}

export function StatsCard({ icon, label, value }: StatsCardProps) {
  return (
    <article className="stat-card">
      <div className="stat-icon">{icon}</div>
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
    </article>
  )
}
