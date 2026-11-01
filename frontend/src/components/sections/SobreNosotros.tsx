import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts'

// ─── Datos del dashboard de gastos ───────────────────────────────────────────
const KPIS = [
  { label: 'Ingresos totales', value: '$284.500', raw: 284500, up: true },
  { label: 'Gastos totales', value: '$156.200', raw: 156200, up: false },
  { label: 'Balance neto', value: '$128.300', raw: 128300, up: true },
  { label: 'Margen', value: '45.1%', raw: 45.1, up: true },
]

const TRANSACTIONS = [
  { concepto: 'Venta producto — Cliente A', categoria: 'Ingreso', monto: 42000, fecha: '12/03', tipo: 'ingreso' },
  { concepto: 'Servidor Railway + Vercel', categoria: 'Infra', monto: -3200, fecha: '10/03', tipo: 'gasto' },
  { concepto: 'Pago suscripción Cliente B', categoria: 'Ingreso', monto: 28500, fecha: '08/03', tipo: 'ingreso' },
  { concepto: 'Herramientas SaaS (Figma, Notion)', categoria: 'Software', monto: -1800, fecha: '07/03', tipo: 'gasto' },
  { concepto: 'Consultoría — Cliente C', categoria: 'Ingreso', monto: 65000, fecha: '05/03', tipo: 'ingreso' },
  { concepto: 'Publicidad LinkedIn Ads', categoria: 'Marketing', monto: -8400, fecha: '03/03', tipo: 'gasto' },
]

// ─── Datos de tendencias anuales ─────────────────────────────────────────────
const MONTHLY = [
  { mes: 'Ene', ingresos: 148000, gastos: 112000 },
  { mes: 'Feb', ingresos: 162000, gastos: 118000 },
  { mes: 'Mar', ingresos: 155000, gastos: 115000 },
  { mes: 'Abr', ingresos: 178000, gastos: 121000 },
  { mes: 'May', ingresos: 191000, gastos: 128000 },
  { mes: 'Jun', ingresos: 205000, gastos: 132000 },
  { mes: 'Jul', ingresos: 198000, gastos: 130000 },
  { mes: 'Ago', ingresos: 224000, gastos: 138000 },
  { mes: 'Sep', ingresos: 241000, gastos: 141000 },
  { mes: 'Oct', ingresos: 258000, gastos: 148000 },
  { mes: 'Nov', ingresos: 272000, gastos: 151000 },
  { mes: 'Dic', ingresos: 284500, gastos: 156200 },
]

const PIE_DATA = [
  { name: 'Desarrollo web', value: 38, monto: '$107.900' },
  { name: 'Apps mobile', value: 24, monto: '$68.200' },
  { name: 'Consultoría', value: 18, monto: '$51.200' },
  { name: 'SaaS productos', value: 12, monto: '$34.100' },
  { name: 'Marketing', value: 5, monto: '$14.200' },
  { name: 'Otros', value: 3, monto: '$8.900' },
]

// Azul, marino, celeste, blanco, lavanda y cielo: distintos entre sí y con contraste sobre negro.
// Verde y rojo quedan reservados para ingresos/gastos y subas/bajas.
const PIE_COLORS = ['#3b6fe0', '#1e3a8a', '#93c5fd', '#f1f5f9', '#a5b4fc', '#38bdf8']
const PIE_TEXT = ['#ffffff', '#ffffff', '#0b1220', '#0b1220', '#0b1220', '#0b1220']
const INGRESOS = '#22c55e'
const GASTOS = '#ef4444'
const TICK = { fill: '#c9ccd3', fontSize: 11, fontFamily: 'Geist Mono, ui-monospace, monospace' }

// Porcentaje dentro de cada porción (se omite en las porciones muy chicas)
const RAD = Math.PI / 180
const pieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, index }: { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; value: number; index: number }) => {
  if (value < 5) return null
  const r = innerRadius + (outerRadius - innerRadius) / 2
  return (
    <text x={cx + r * Math.cos(-midAngle * RAD)} y={cy + r * Math.sin(-midAngle * RAD)} fill={PIE_TEXT[index]}
      textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600} fontFamily="Geist, system-ui, sans-serif">
      {value}%
    </text>
  )
}

const TP = {
  contentStyle: { background: 'rgb(var(--c-surface))', border: '1px solid rgb(var(--c-border))', borderRadius: 0, fontFamily: 'Geist, system-ui, sans-serif', fontSize: 12 },
  labelStyle: { color: 'rgb(var(--c-text))' },
}

// ─── Custom Pie label ─────────────────────────────────────────────────────────
const PieLegend = ({ payload }: { payload?: { color: string; value: string; payload: { monto: string; value: number } }[] }) => (
  <div className="flex flex-col gap-1.5 justify-center">
    {payload?.map((entry) => (
      <div key={entry.value} className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: entry.color }} />
        <span className="font-body text-xs text-muted">{entry.value}</span>
        <span className="font-mono text-xs text-text ml-auto">{entry.payload.value}%</span>
      </div>
    ))}
  </div>
)

export default function SobreNosotros() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} id="sobre" className="py-16 px-4 bg-surface">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="section-label mb-3">Sobre Cracker</p>
          <h2 className="section-heading max-w-2xl">
            Software que tu negocio<br />
            <span className="text-accent-light">realmente necesita.</span>
          </h2>
          <p className="font-body text-muted mt-4 max-w-xl leading-relaxed text-sm">
            Construimos herramientas que te dan visibilidad total sobre tu negocio. Control de gastos, análisis de tendencias y dashboards que usás todos los días.
          </p>
        </motion.div>

        {/* BLOQUE 1 — Dashboard de gastos */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="card overflow-hidden">
            {/* Title bar */}
            <div className="border-b border-border px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="font-display font-medium text-base text-text tracking-tight">
                  Llevá el control de los gastos de tu emprendimiento o empresa
                </h3>
                <p className="font-mono text-xs text-muted mt-0.5">Mi Empresa SRL · Marzo 2026</p>
              </div>
              <span className="font-mono text-xs text-accent-light border border-accent/30 px-2 py-1 self-start sm:self-auto">
                En tiempo real
              </span>
            </div>

            <div className="p-6 space-y-6">
              {/* KPI cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {KPIS.map((k) => (
                  <div key={k.label} className="bg-surface-2 border border-border p-4 rounded-sm">
                    <p className="font-mono text-xs text-muted mb-2">{k.label}</p>
                    <p className="font-display font-medium text-xl text-text leading-none">{k.value}</p>
                    <p className={`font-mono text-xs mt-2 ${k.up ? 'text-emerald-400' : 'text-red-400'}`}>
                      {k.up ? '↑' : '↓'} vs mes anterior
                    </p>
                  </div>
                ))}
              </div>

              {/* Transactions */}
              <div>
                <p className="font-mono text-xs text-muted mb-3 tracking-wider uppercase">Últimas transacciones</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-mono text-xs text-muted">Concepto</th>
                        <th className="text-left py-2 px-3 font-mono text-xs text-muted hidden sm:table-cell">Categoría</th>
                        <th className="text-right py-2 px-3 font-mono text-xs text-muted">Monto</th>
                        <th className="text-right py-2 px-3 font-mono text-xs text-muted hidden md:table-cell">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TRANSACTIONS.map((t, i) => (
                        <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-surface transition-colors">
                          <td className="py-2.5 px-3 font-body text-xs text-text">{t.concepto}</td>
                          <td className="py-2.5 px-3 font-mono text-xs text-muted hidden sm:table-cell">{t.categoria}</td>
                          <td className={`py-2.5 px-3 font-mono text-sm text-right font-semibold ${t.tipo === 'ingreso' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {t.tipo === 'ingreso' ? '+' : ''}${Math.abs(t.monto).toLocaleString('es-AR')}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-xs text-muted text-right hidden md:table-cell">{t.fecha}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* BLOQUE 2 — Tendencias */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="card overflow-hidden">
            <div className="border-b border-border px-6 py-4">
              <h3 className="font-display font-medium text-base text-text tracking-tight">
                Analizá tendencias anuales y tomá mejores decisiones
              </h3>
              <p className="font-mono text-xs text-muted mt-0.5">Ingresos vs Gastos · Distribución por área</p>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1 — Barras Ingresos vs Gastos */}
              <div>
                <p className="font-body text-sm text-text mb-1">Ingresos vs Gastos anuales</p>
                <p className="font-mono text-xs text-muted mb-4">Evolución mensual 2026</p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={MONTHLY} barGap={3} barCategoryGap="18%">
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="mes" tick={TICK} axisLine={false} tickLine={false} />
                    <YAxis tick={TICK} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} width={52} />
                    <Tooltip
                      {...TP}
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      formatter={(v: number, name: string) => [`$${(v / 1000).toFixed(1)}K`, name === 'ingresos' ? 'Ingresos' : 'Gastos']}
                    />
                    <Bar dataKey="ingresos" fill={INGRESOS} radius={[3, 3, 0, 0]} name="ingresos" />
                    <Bar dataKey="gastos" fill={GASTOS} radius={[3, 3, 0, 0]} name="gastos" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm" style={{ background: INGRESOS }} />
                    <span className="font-mono text-xs text-muted">Ingresos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm" style={{ background: GASTOS }} />
                    <span className="font-mono text-xs text-muted">Gastos</span>
                  </div>
                </div>
              </div>

              {/* Chart 2 — Donut por área */}
              <div>
                <p className="font-body text-sm text-text mb-1">Distribución por área de negocio</p>
                <p className="font-mono text-xs text-muted mb-4">% del total de ingresos</p>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ResponsiveContainer width={260} height={260} className="flex-none">
                    <PieChart>
                      <Pie
                        data={PIE_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={68}
                        outerRadius={124}
                        paddingAngle={1.5}
                        dataKey="value"
                        stroke="rgb(var(--c-surface))"
                        strokeWidth={2}
                        label={pieLabel}
                        labelLine={false}
                        isAnimationActive={false}
                      >
                        {PIE_DATA.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        {...TP}
                        formatter={(v: number) => [`${v}%`, 'Participación']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 w-full min-w-0 space-y-2.5">
                    {PIE_DATA.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                        <span className="font-body text-sm text-text flex-1 min-w-0 truncate">{d.name}</span>
                        <span className="font-mono text-xs text-muted tabular-nums">{d.monto}</span>
                        <span className="font-mono text-sm text-text w-10 text-right tabular-nums">{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
