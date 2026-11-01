import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Tabs } from '../../components/booking/ui'

export default function AdminLayout() {
  useEffect(() => { document.title = 'Panel admin — Cracker' }, [])
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <p className="section-label mb-2">Panel admin</p>
      <h1 className="font-display font-medium text-3xl text-text tracking-tight mb-6">Agenda y clientes</h1>
      <Tabs label="Secciones del panel" items={[
        { to: '/admin', label: 'Citas', end: true },
        { to: '/admin/disponibilidad', label: 'Disponibilidad' },
        { to: '/admin/clientes', label: 'Clientes' },
      ]} />
      <div className="pt-6"><Outlet /></div>
    </div>
  )
}
