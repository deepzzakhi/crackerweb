import { useEffect } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Tabs } from '../../components/booking/ui'

export default function CuentaLayout() {
  const user = useAuthStore((s) => s.user)
  useEffect(() => { document.title = 'Mi cuenta — Cracker' }, [])
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="section-label mb-2">Mi cuenta</p>
          <h1 className="font-display font-medium text-3xl text-text tracking-tight">Hola, {user?.name?.split(' ')[0] ?? 'te damos la bienvenida'}</h1>
        </div>
        <Link to="/agendar" className="btn-primary min-h-11">Agendar reunión</Link>
      </div>
      <Tabs label="Secciones de tu cuenta" items={[
        { to: '/cuenta', label: 'Mis citas', end: true },
        { to: '/cuenta/proyectos', label: 'Mis proyectos' },
        { to: '/cuenta/finanzas', label: 'Finanzas' },
      ]} />
      <div className="pt-6"><Outlet /></div>
    </div>
  )
}
