import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import api from '../../services/api'

interface ReportsData {
  monthly: { month: string; value: number; expenses: number; profit: number }[]
  byService: { service: string; revenue: number; projects: number }[]
}

const TP = {
  contentStyle: { background: '#101010', border: '1px solid #242424', borderRadius: 0, fontFamily: 'DM Sans', fontSize: 12 },
  labelStyle: { color: '#EBEBEB' },
}

export default function Reports() {
  const [data, setData] = useState<ReportsData | null>(null)

  useEffect(() => {
    document.title = 'Reportes — Cracker'
    api.get('/dashboard/reports').then(r => setData(r.data.data)).catch(console.error)
  }, [])

  if (!data) return <div className="flex items-center justify-center h-64"><div className="font-mono text-xs text-muted animate-pulse">Cargando...</div></div>

  const totalRevenue = data.byService.reduce((sum, s) => sum + s.revenue, 0)
  const totalProfit = data.monthly.reduce((sum, m) => sum + m.profit, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted mb-1">Dashboard</p>
          <h1 className="font-display font-bold text-2xl text-text tracking-tight">Reportes</h1>
        </div>
        <button className="btn-secondary text-xs py-2 px-4 self-start">
          Exportar CSV ↓
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Revenue total (6M)', value: `$${(totalRevenue / 1000).toFixed(1)}K` },
          { label: 'Ganancia neta (6M)', value: `$${(totalProfit / 1000).toFixed(1)}K` },
          { label: 'Margen promedio', value: `${Math.round((totalProfit / totalRevenue) * 100)}%` },
          { label: 'Servicios activos', value: `${data.byService.length}` },
        ].map(k => (
          <div key={k.label} className="card p-5">
            <p className="font-mono text-xs text-muted mb-2">{k.label}</p>
            <p className="font-display font-bold text-2xl text-text">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* P&L mensual */}
        <div className="card p-6">
          <p className="font-body text-sm font-medium text-text mb-1">P&L mensual</p>
          <p className="font-mono text-xs text-muted mb-6">Revenue vs Gastos vs Ganancia</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.monthly} barGap={2}>
              <CartesianGrid stroke="#1A1A1A" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#555', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#555', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <Tooltip {...TP} formatter={(v: number) => [`$${(v/1000).toFixed(1)}K`]} itemStyle={{ color: '#60a5fa' }} />
              <Bar dataKey="value" fill="#60a5fa" opacity={0.25} radius={[2, 2, 0, 0]} name="Revenue" barSize={14} />
              <Bar dataKey="expenses" fill="#F97316" opacity={0.5} radius={[2, 2, 0, 0]} name="Gastos" barSize={14} />
              <Bar dataKey="profit" fill="#60a5fa" opacity={0.9} radius={[2, 2, 0, 0]} name="Ganancia" barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue por servicio */}
        <div className="card p-6">
          <p className="font-body text-sm font-medium text-text mb-1">Revenue por servicio</p>
          <p className="font-mono text-xs text-muted mb-6">Distribución acumulada</p>
          <div className="space-y-4">
            {data.byService.map((s, i) => {
              const pct = Math.round((s.revenue / totalRevenue) * 100)
              const colors = ['#60a5fa', '#60A5FA', '#A78BFA', '#F97316']
              return (
                <div key={s.service}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-body text-xs text-text">{s.service}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs text-muted">{s.projects} proyectos</span>
                      <span className="font-mono text-xs text-text w-16 text-right">${(s.revenue / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                  <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length] }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
