import type { Member } from '../../types'

interface FamilyGridProps {
  members: Member[]
}

export function FamilyGrid({ members }: FamilyGridProps) {
  return (
    <section className="family-grid">
      <div className="section-trailer">
        <p className="eyebrow">Our family</p>
        <h2>Stories are best when we share them.</h2>
      </div>
      <div className="family-cards">
        {members.map((member) => (
          <article key={member.name} className="family-card">
            <div className="family-avatar" aria-hidden="true">
              {member.initial}
            </div>
            <div className="family-copy">
              <h3>{member.name}</h3>
              <p>{member.booksCompleted} books completed</p>
              <p>{member.currentlyListening}</p>
              <p className="family-meta">Favorite: {member.favoriteGenre}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
