import { NavLink } from 'react-router-dom'

const items = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'library', label: 'Library', path: '/library' },
  { id: 'wishlist', label: 'Want to Read', path: '/want-to-read' },
  { id: 'stats', label: 'Stats', path: '/stats' },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Bottom navigation">
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <NavLink to={item.path} className={({ isActive }) => `bottom-nav-link${isActive ? ' active' : ''}`}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
