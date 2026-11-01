import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import clsx from 'clsx'
import ThemeToggle from '../ui/ThemeToggle'

const LINKS = [
  { to: '/servicios', label: 'Servicios' },
  { to: '/casos', label: 'Casos' },
  { to: '/#sobre', label: 'Sobre Cracker' },
  { to: '/blog', label: 'Blog' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setOpen(false) }, [location])

  const isDashboard = location.pathname.startsWith('/dashboard')

  return (
    <header className={clsx(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-background/90 backdrop-blur-md border-b border-border' : 'bg-transparent'
    )}>
      <nav className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-display font-extrabold text-xl tracking-tighter text-text hover:text-accent transition-colors">
          CRACKER<span className="text-accent animate-blink">_</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={clsx(
                'font-body text-sm transition-colors duration-200',
                location.pathname === l.to ? 'text-accent' : 'text-muted hover:text-text'
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              {!isDashboard && (
                <Link to="/dashboard" className="btn-ghost text-sm">
                  Dashboard
                </Link>
              )}
              <div className="flex items-center gap-2">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center font-mono text-xs text-accent">
                    {user?.name?.charAt(0)}
                  </div>
                )}
                <button onClick={() => { logout(); navigate('/') }} className="btn-ghost text-sm text-muted">
                  Salir
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm">Ingresar</Link>
              <Link to="/contacto" className="btn-secondary text-xs py-2 px-4">Contacto</Link>
            </>
          )}
        </div>

        {/* Mobile: tema + hamburguesa */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="flex flex-col gap-1.5 p-2"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <span className={clsx('w-5 h-px bg-text transition-all duration-300', open && 'rotate-45 translate-y-[7px]')} />
            <span className={clsx('w-5 h-px bg-text transition-all duration-300', open && 'opacity-0')} />
            <span className={clsx('w-5 h-px bg-text transition-all duration-300', open && '-rotate-45 -translate-y-[7px]')} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden bg-surface border-b border-border px-4 py-6 flex flex-col gap-4"
          >
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={clsx('font-body text-base py-1', location.pathname === l.to ? 'text-accent' : 'text-muted')}
              >
                {l.label}
              </Link>
            ))}
            <div className="border-t border-border pt-4 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="btn-primary w-full justify-center text-xs">Dashboard</Link>
                  <button onClick={() => { logout(); navigate('/') }} className="btn-secondary w-full justify-center text-xs">Salir</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary w-full justify-center text-xs">Ingresar</Link>
                  <Link to="/contacto" className="btn-primary w-full justify-center text-xs">Contacto</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
