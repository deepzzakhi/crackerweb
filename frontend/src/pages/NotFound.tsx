import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="relative z-10 text-center">
        <p className="font-display font-extrabold text-[10rem] md:text-[16rem] leading-none text-accent/10 select-none">404</p>
        <h1 className="font-display font-bold text-3xl text-text tracking-tight -mt-8 mb-4">Página no encontrada</h1>
        <p className="font-body text-muted mb-8">Esta URL no existe o fue movida.</p>
        <Link to="/" className="btn-primary text-sm">← Volver al inicio</Link>
      </div>
    </div>
  )
}
