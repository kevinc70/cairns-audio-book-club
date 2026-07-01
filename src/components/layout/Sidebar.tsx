import type { NavItem } from '../../types'

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'library', label: 'Library', icon: '📚' },
  { id: 'wishlist', label: 'Want To Read', icon: '✨' },
  { id: 'stats', label: 'Statistics', icon: '📈' },
]

export function Sidebar() {
  return (
    <aside className="app-sidebar" aria-label="Primary navigation">
      <div className="sidebar-panel">
        <div className="sidebar-brand">
          <span className="brand-mark">C</span>
          <div>
            <p className="brand-label">Cairns Audio Book Club</p>
            <p className="brand-subtitle">Curated listening, friendly community</p>
          </div>
        </div>
        <nav>
          <ul className="sidebar-nav">
            {navItems.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="sidebar-link">
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}
