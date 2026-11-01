import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import clsx from 'clsx'
import ThemeToggle from '../ui/ThemeToggle'

const NAV = [
  { to: '/dashboard', label: 'Overview', icon: '◈', end: true },
  { to: '/dashboard/analytics', label: 'Analytics', icon: '◉', end: false },
  { to: '/dashboard/proyectos', label: 'Proyectos', icon: '◆', end: false },
  { to: '/dashboard/reportes', label: 'Reportes', icon: '◇', end: false },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-40 w-56 bg-surface border-r border-border flex flex-col transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-border">
          <NavLink to="/" className="font-display font-extrabold text-base tracking-tighter text-text">
            CRACKER<span className="text-accent">_</span>
          </NavLink>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted hover:text-text">✕</button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 font-body text-sm transition-all duration-200 rounded-sm',
                isActive ? 'bg-accent/10 text-accent border-l-2 border-accent pl-[10px]' : 'text-muted hover:text-text hover:bg-surface-2'
              )}
            >
              <span className="font-mono text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center font-mono text-xs text-accent">
                {user?.name?.charAt(0) ?? 'U'}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-body text-xs text-text truncate">{user?.name}</p>
              <p className="font-mono text-xs text-muted truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/') }}
            className="w-full btn-ghost text-xs justify-start text-muted hover:text-accent"
          >
            ← Salir
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-surface/50 backdrop-blur flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
          <button className="md:hidden p-1" onClick={() => setSidebarOpen(true)}>
            <div className="flex flex-col gap-1">
              <span className="w-5 h-px bg-text" />
              <span className="w-5 h-px bg-text" />
              <span className="w-3 h-px bg-text" />
            </div>
          </button>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted">Demo Dashboard</span>
            <span className="badge badge-live">Live</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NavLink to="/" className="font-body text-xs text-muted hover:text-accent transition-colors">
              ← Volver al sitio
            </NavLink>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
