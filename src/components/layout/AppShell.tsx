import type { ReactNode } from 'react'
import { TopBar } from './TopBar'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <TopBar />
      <main className="app-main">{children}</main>
    </div>
  )
}
