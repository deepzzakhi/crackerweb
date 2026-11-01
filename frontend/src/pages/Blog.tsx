import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Blog() {
  useEffect(() => { document.title = 'Blog — Cracker' }, [])
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="relative z-10 text-center max-w-md">
        <p className="font-mono text-accent text-xs tracking-[0.3em] mb-6">PRÓXIMAMENTE</p>
        <h1 className="font-display font-semibold text-6xl text-text tracking-tight mb-6">Blog</h1>
        <p className="font-body text-muted mb-8 leading-relaxed">
          Casos de estudio, arquitectura de software, lecciones aprendidas en proyectos reales.
        </p>
        <div className="card p-6 mb-8">
          <p className="font-mono text-xs text-muted mb-4">Temas que vienen:</p>
          <ul className="space-y-2 text-left">
            {[
              'Cómo arquitectamos un SaaS desde cero en 8 semanas',
              'PostgreSQL vs MongoDB: lo que aprendimos en producción',
              'React Native en 2026: el estado real del arte',
              'Cómo construir un dashboard que los usuarios usen',
            ].map(t => (
              <li key={t} className="flex items-start gap-2 font-body text-xs text-muted">
                <span className="text-accent mt-0.5">›</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <Link to="/" className="btn-secondary text-xs">← Volver al inicio</Link>
      </div>
    </div>
  )
}
