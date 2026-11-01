import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ComposedChart, Area, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import Logo from '../ui/Logo'

// Datos de ejemplo de la demo: año actual vs año anterior por sección
const MESES = ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar']
type Seccion = 'ventas' | 'stock' | 'empleados'
const SERIES: Record<Seccion, { titulo: string; actual: number[]; anterior: number[]; fmt: (v: number) => string; mejorSiSube: boolean }> = {
  ventas: { titulo: 'Ventas', actual: [71, 83, 96, 88, 112, 128.4], anterior: [62, 70, 81, 77, 92, 101], fmt: v => `$${v.toFixed(1)}K`, mejorSiSube: true },
  stock: { titulo: 'Stock', actual: [1300, 1250, 1390, 1320, 1280, 1210], anterior: [1420, 1380, 1510, 1460, 1400, 1350], fmt: v => `${Math.round(v).toLocaleString('es-AR')} u.`, mejorSiSube: false },
  empleados: { titulo: 'Empleados', actual: [14, 15, 15, 16, 17, 18], anterior: [12, 12, 13, 13, 14, 14], fmt: v => `${Math.round(v)}`, mejorSiSube: true },
}

const KPIS = [
  { label: 'Ventas del mes', value: '$128.4K', change: '+12.4%', up: true },
  { label: 'Stock', value: '1.210 u.', change: '−5.5%', up: false },
  { label: 'Empleados', value: '18', change: '+4', up: true },
  { label: 'Margen', value: '34%', change: '−1.2%', up: false },
]

const MARINO = '#3b6fe0'      // año actual
const ANTERIOR = '#e5e7eb'    // año anterior (blanco suave)
const TICK = { fill: '#c9ccd3', fontSize: 11, fontFamily: 'Geist Mono, ui-monospace, monospace' }

export default function DashboardPreview() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [sec, setSec] = useState<Seccion>('ventas')
  const s = SERIES[sec]
  const data = MESES.map((m, i) => ({ m, actual: s.actual[i], anterior: s.anterior[i] }))
  const total = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
  const variacion = ((total(s.actual) - total(s.anterior)) / total(s.anterior)) * 100
  const bueno = s.mejorSiSube ? variacion >= 0 : variacion <= 0

  return (
    <section ref={ref} id="demo" className="py-16 px-4 bg-surface relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <p className="section-label mb-4">Demo en vivo</p>
          <h2 className="section-heading mb-4">
            Así se ve el software<br />
            <span className="text-accent-light">que construimos.</span>
          </h2>
          <p className="font-body text-muted max-w-lg mx-auto">
            Entrá al dashboard de prueba y miralo funcionando, con datos de ejemplo.
          </p>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Browser chrome */}
          <div className="bg-surface-2 rounded-t-lg border border-border px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 mx-4 bg-surface rounded px-3 py-1 font-mono text-xs text-muted text-center">
              tu-negocio.app/dashboard
            </div>
          </div>

          {/* Dashboard content */}
          <div className="bg-background border border-t-0 border-border rounded-b-lg overflow-hidden">
            <div className="flex">
              {/* Sidebar mini */}
              <div className="hidden sm:flex flex-col w-44 border-r border-border bg-surface p-3 gap-1">
                <div className="h-8 flex items-center px-2 mb-2">
                  <Logo size="sm" />
                </div>
                {(['ventas', 'stock', 'empleados'] as Seccion[]).map((k) => (
                  <button key={k} type="button" onClick={() => setSec(k)}
                    className={`flex items-center gap-2 px-2 py-2 rounded-sm font-body text-xs text-left transition-colors ${sec === k ? 'bg-accent/15 text-text border-l-2 border-accent' : 'text-muted hover:text-text'}`}>
                    <span className="font-mono">◈</span>
                    {SERIES[k].titulo}
                  </button>
                ))}
                <div className="flex items-center gap-2 px-2 py-2 font-body text-xs text-muted"><span className="font-mono">◈</span>Reportes</div>
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0 p-4 md:p-6 space-y-4">
                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {KPIS.map((kpi) => (
                    <div key={kpi.label} className="bg-surface border border-border rounded-sm p-3">
                      <p className="font-mono text-xs text-muted mb-1">{kpi.label}</p>
                      <p className="font-display font-medium text-xl text-text">{kpi.value}</p>
                      <p className={`font-mono text-xs mt-0.5 ${kpi.up ? 'text-emerald-400' : 'text-red-400'}`}>{kpi.change} vs año ant.</p>
                    </div>
                  ))}
                </div>

                {/* Chart comparativo */}
                <div className="bg-surface border border-border rounded-sm p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <p className="font-body text-sm text-text">{s.titulo}: 2026 vs 2025</p>
                      <p className={`font-mono text-xs mt-0.5 ${bueno ? 'text-emerald-400' : 'text-red-400'}`}>
                        {variacion >= 0 ? '+' : '−'}{Math.abs(variacion).toFixed(1)}% vs año anterior
                      </p>
                    </div>
                    {/* Secciones (también en mobile, donde no hay barra lateral) */}
                    <div className="flex gap-1" role="tablist" aria-label="Sección del dashboard">
                      {(['ventas', 'stock', 'empleados'] as Seccion[]).map((k) => (
                        <button key={k} type="button" role="tab" aria-selected={sec === k} onClick={() => setSec(k)}
                          className={`font-mono text-xs px-3 py-1.5 border transition-colors ${sec === k ? 'border-accent bg-accent text-white' : 'border-border text-muted hover:text-text'}`}>
                          {SERIES[k].titulo}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={190}>
                    <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={MARINO} stopOpacity={0.35} />
                          <stop offset="95%" stopColor={MARINO} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="m" tick={TICK} axisLine={false} tickLine={false} />
                      <YAxis tick={TICK} axisLine={false} tickLine={false} width={56} tickFormatter={(v: number) => s.fmt(v)} />
                      <Tooltip
                        contentStyle={{ background: 'rgb(var(--c-surface))', border: '1px solid rgb(var(--c-border))', borderRadius: 0, fontFamily: 'Geist, system-ui, sans-serif', fontSize: 12 }}
                        labelStyle={{ color: 'rgb(var(--c-text))' }}
                        formatter={(v: number, name: string) => [s.fmt(v), name === 'actual' ? '2026' : '2025']}
                      />
                      <Area type="monotone" dataKey="actual" stroke={MARINO} strokeWidth={2.5} fill="url(#gradActual)" dot={false} />
                      <Line type="monotone" dataKey="anterior" stroke={ANTERIOR} strokeOpacity={0.7} strokeWidth={1.5} strokeDasharray="5 4" dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                  <div className="flex gap-4 mt-2">
                    <span className="flex items-center gap-1.5 font-mono text-xs text-muted"><span className="w-4 h-0.5" style={{ background: MARINO }} />2026</span>
                    <span className="flex items-center gap-1.5 font-mono text-xs text-muted"><span className="w-4 border-t border-dashed" style={{ borderColor: ANTERIOR }} />2025</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex justify-center mt-6">
            <Link to="/login" className="btn-primary text-sm px-8">
              Ver el dashboard completo
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
