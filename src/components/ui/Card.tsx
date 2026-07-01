import type { ReactNode } from 'react'

interface CardProps {
  title: string
  children: ReactNode
  className?: string
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <article className={`card ${className}`}>
      <h2>{title}</h2>
      <div className="card-body">{children}</div>
    </article>
  )
}
