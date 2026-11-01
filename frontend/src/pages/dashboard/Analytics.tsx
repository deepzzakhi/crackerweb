import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Funnel, FunnelChart, LabelList } from 'recharts'
import api from '../../services/api'

interface AnalyticsData {
  funnel: { stage: string; value: number }[]
  retention: { month: string; rate: number }[]
  channels: { name: string; value: number }[]
  weeklyActivity: { day: string; sessions: number; conversions: number }[]
}

const TP = {
  contentStyle: { background: 'rgb(var(--c-surface))', border: '1px solid rgb(var(--c-border))', borderRadius: 0, fontFamily: 'DM Sans', fontSize: 12 },
  labelStyle: { color: 'rgb(var(--c-text))' },
}

const COLORS = ['#60a5fa', '#60A5FA', '#F97316', '#A78BFA']

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    document.title = 'Analytics — Cracker'
    api.get('/dashboard/analytics').then(r => setData(r.data.data)).catch(console.error)
  }, [])

  if (!data) return <div className="flex items-center justify-center h-64"><div className="font-mono text-xs text-muted animate-pulse">Cargando...</div></div>

  const totalFunnel = data.funnel[0]?.value ?? 1

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs text-muted mb-1">Dashboard</p>
        <h1 className="font-display font-bold text-2xl text-text tracking-tight">Analytics</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Funnel */}
        <div className="card p-6">
          <p className="font-body text-sm font-medium text-text mb-1">Funnel de conversión</p>
          <p className="font-mono text-xs text-muted mb-6">Últimos 30 días</p>
          <div className="space-y-3">
            {data.funnel.map((item, i) => (
              <div key={item.stage}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-body text-xs text-text">{item.stage}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted">{((item.value / totalFunnel) * 100).toFixed(1)}%</span>
                    <span className="font-mono text-xs text-text w-12 text-right">{item.value.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(item.value / totalFunnel) * 100}%`, backgroundColor: COLORS[i] ?? '#60a5fa' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Canales */}
        <div className="card p-6">
          <p className="font-body text-sm font-medium text-text mb-1">Canales de adquisición</p>
          <p className="font-mono text-xs text-muted mb-6">% del total de leads</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={data.channels} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={55} strokeWidth={0}>
                  {data.channels.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {data.channels.map((c, i) => (
                <div key={c.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="font-body text-xs text-muted">{c.name}</span>
                  </div>
                  <span className="font-mono text-xs text-text">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Retención */}
        <div className="card p-6">
          <p className="font-body text-sm font-medium text-text mb-1">Retención de clientes</p>
          <p className="font-mono text-xs text-muted mb-6">% clientes activos por cohorte</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data.retention}>
              <CartesianGrid stroke="rgba(128,128,128,0.18)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#555', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#555', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
              <Tooltip {...TP} formatter={(v: number) => [`${v}%`, 'Retención']} itemStyle={{ color: '#60a5fa' }} />
              <Line type="monotone" dataKey="rate" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Actividad semanal */}
        <div className="card p-6">
          <p className="font-body text-sm font-medium text-text mb-1">Actividad semanal</p>
          <p className="font-mono text-xs text-muted mb-6">Sesiones vs Conversiones</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.weeklyActivity} barGap={2}>
              <CartesianGrid stroke="rgba(128,128,128,0.18)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#555', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#555', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip {...TP} itemStyle={{ color: '#60a5fa' }} />
              <Bar dataKey="sessions" fill="#60a5fa" opacity={0.3} radius={[2, 2, 0, 0]} name="Sesiones" barSize={10} />
              <Bar dataKey="conversions" fill="#60a5fa" opacity={0.9} radius={[2, 2, 0, 0]} name="Conversiones" barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
