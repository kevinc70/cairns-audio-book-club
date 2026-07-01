import type { ReactNode } from 'react'

interface HeroCardProps {
  title: string
  author: string
  description: string
  children?: ReactNode
}

export function HeroCard({ title, author, description, children }: HeroCardProps) {
  return (
    <section className="hero-card">
      <div className="hero-card-cover">
        <div className="cover-frame">
          <div className="cover-label">Audio Book</div>
          <div className="cover-shelf" />
        </div>
      </div>
      <div className="hero-card-copy">
        <p className="eyebrow">Current audiobook</p>
        <h2>{title}</h2>
        <p className="hero-author">by {author}</p>
        <p className="hero-description">{description}</p>
        {children}
      </div>
    </section>
  )
}
