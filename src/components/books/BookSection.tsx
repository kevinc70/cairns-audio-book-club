interface BookSectionProps {
  title: string
  items: string[]
}

export function BookSection({ title, items }: BookSectionProps) {
  return (
    <section className="book-section">
      <div className="section-header">
        <p className="eyebrow">Curated for you</p>
        <h2>{title}</h2>
      </div>
      <ul className="book-list">
        {items.map((item) => (
          <li key={item} className="book-list-item">
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}
