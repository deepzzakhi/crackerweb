import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <Link to="/" className="font-display font-extrabold text-2xl tracking-tighter text-text">
              CRACKER<span className="text-accent">_</span>
            </Link>
            <p className="font-body text-sm text-muted mt-3 max-w-xs leading-relaxed">
              Construimos el software que tu negocio necesita para crecer. Desde MVPs hasta sistemas empresariales.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="https://github.com/AlexisPlescia" target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-muted hover:text-accent transition-colors">GitHub</a>
              <a href="https://www.linkedin.com/in/alexisplescia/" target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-muted hover:text-accent transition-colors">LinkedIn</a>
            </div>
          </div>
          <div>
            <p className="font-mono text-xs text-muted tracking-widest uppercase mb-4">Empresa</p>
            <div className="flex flex-col gap-2">
              {[['Servicios', '/servicios'], ['Casos', '/casos'], ['Equipo', '/equipo'], ['Blog', '/blog']].map(([label, to]) => (
                <Link key={to} to={to} className="font-body text-sm text-muted hover:text-text transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-xs text-muted tracking-widest uppercase mb-4">Contacto</p>
            <div className="flex flex-col gap-2">
              <a href="mailto:hola@cracker.dev" className="font-body text-sm text-muted hover:text-accent transition-colors">hola@cracker.dev</a>
              <Link to="/contacto" className="font-body text-sm text-muted hover:text-text transition-colors">Formulario de contacto</Link>
              <Link to="/login" className="font-body text-sm text-muted hover:text-text transition-colors">Ver demo</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-mono text-xs text-muted">© 2026 Cracker Software. Todos los derechos reservados.</p>
          <p className="font-mono text-xs text-muted/40">Construido con React + Node.js + PostgreSQL</p>
        </div>
      </div>
    </footer>
  )
}
