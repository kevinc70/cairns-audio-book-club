const items = [
  { id: 'home', label: 'Home' },
  { id: 'library', label: 'Library' },
  { id: 'wishlist', label: 'Shelf' },
  { id: 'stats', label: 'Stats' },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Bottom navigation">
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="bottom-nav-link">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
