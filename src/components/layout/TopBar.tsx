import { Bell, Search, Settings, UserCircle } from 'lucide-react'

export function TopBar() {
  return (
    <header className="top-bar">
      <div className="top-bar-brand">
        <div className="logo-mark" aria-hidden="true">
          A
        </div>
        <div>
          <p className="top-bar-subtitle">Audio Book Club</p>
          <p className="top-bar-tag">A story room for our family.</p>
        </div>
      </div>

      <div className="top-bar-actions">
        <button type="button" className="icon-button" aria-label="Search">
          <Search size={18} />
        </button>
        <button type="button" className="icon-button" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <button type="button" className="icon-button" aria-label="Settings">
          <Settings size={18} />
        </button>
        <button type="button" className="avatar-button" aria-label="Profile">
          <UserCircle size={22} />
        </button>
      </div>
    </header>
  )
}
