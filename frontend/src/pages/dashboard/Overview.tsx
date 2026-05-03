import { useEffect, useState } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import KPICard from '../../components/dashboard/KPICard'
import api from '../../services/api'
import type { KPI, TimePoint } from '../../types'

interface OverviewData {
  kpis: KPI[]
  revenue: TimePoint[]
  users: TimePoint[]
}

const TOOLTIP_STYLE = {
  contentStyle: { background: '#101010', border: '1px solid #242424', borderRadius: 0, fontFamily: 'DM Sans', fontSize: 12 },
  labelStyle: { color: '#EBEBEB' },
  itemStyle: { color: '#60a5fa' },
}

export default function Overview() {
  const [data, setData] = useState<OverviewData | null>(null)

  useEffect(() => {
    document.title = 'Dashboard — Cracker'
    api.get('/dashboard/overview').then(r => setData(r.data.data)).catch(console.error)
  }, [])

  if (!data) return (
    <div className="flex items-center justify-center h-64">
      <div className="font-mono text-xs text-muted animate-pulse">Cargando datos...</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs text-muted mb-1">Dashboard</p>
        <h1 className="font-display font-bold text-2xl text-text tracking-tight">Overview</h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data.kpis.map((kpi, i) => <KPICard key={kpi.label} kpi={kpi} delay={i * 0.08} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue - ocupa 2 cols */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-body text-sm font-medium text-text">Revenue mensual</p>
              <p className="font-mono text-xs text-muted mt-0.5">Últimos 12 meses</p>
            </div>
            <span className="font-mono text-xs text-accent border border-accent/30 px-2 py-0.5">USD</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.revenue}>
              <defs>
                <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1A1A1A" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#555', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#555', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`$${(v/1000).toFixed(1)}K`, 'Revenue']} />
              <Area type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2} fill="url(#gradRev)" dot={false} activeDot={{ r: 4, fill: '#60a5fa', stroke: '#080808', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Usuarios activos */}
        <div className="card p-6">
          <div className="mb-6">
            <p className="font-body text-sm font-medium text-text">Usuarios activos</p>
            <p className="font-mono text-xs text-muted mt-0.5">Últimos 12 meses</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.users} barSize={8}>
              <CartesianGrid stroke="#1A1A1A" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#555', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [v, 'Usuarios']} />
              <Bar dataKey="value" fill="#60a5fa" opacity={0.7} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity feed */}
      <div className="card p-6">
        <p className="font-body text-sm font-medium text-text mb-5">Actividad reciente</p>
        <div className="space-y-3">
          {[
            { time: 'Hace 2h', event: 'Nuevo proyecto creado', detail: 'API Gateway Bancario — FinBank Digital', color: '#60a5fa' },
            { time: 'Hace 5h', event: 'Hito completado', detail: 'Dashboard KPIs RetailCorp — Sprint 4/6', color: '#60A5FA' },
            { time: 'Ayer', event: 'Propuesta enviada', detail: 'Plataforma E-learning — EduTech Pro', color: '#F97316' },
            { time: 'Ayer', event: 'Pago recibido', detail: '$2.800 — App Mobile TransLog · Sprint 2', color: '#60a5fa' },
            { time: 'Hace 3 días', event: 'Proyecto live', detail: 'PropCRM entró en beta pública', color: '#A78BFA' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 py-3 border-b border-border last:border-0">
              <span className="font-mono text-xs text-muted w-20 flex-shrink-0 pt-0.5">{item.time}</span>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <div className="min-w-0">
                  <span className="font-body text-sm text-text">{item.event}</span>
                  <span className="font-mono text-xs text-muted ml-2">{item.detail}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
