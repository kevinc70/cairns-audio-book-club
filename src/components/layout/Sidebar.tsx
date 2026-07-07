import type { NavItem } from '../../types'
import { NavLink } from 'react-router-dom'

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'library', label: 'Library', icon: '📚' },
  { id: 'wishlist', label: 'Want to Read', icon: '✨' },
  { id: 'stats', label: 'Statistics', icon: '📈' },
]

function pathFor(id: string) {
  switch (id) {
    case 'home':
      return '/'
    case 'library':
      return '/library'
    case 'wishlist':
      return '/want-to-read'
    case 'stats':
      return '/stats'
    default:
      return '/'
  }
}

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
                <NavLink to={pathFor(item.id)} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}
