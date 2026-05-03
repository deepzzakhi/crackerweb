import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

const DATA = [
  { m: 'Oct', v: 71000 }, { m: 'Nov', v: 83000 }, { m: 'Dic', v: 96000 },
  { m: 'Ene', v: 88000 }, { m: 'Feb', v: 112000 }, { m: 'Mar', v: 128400 },
]

const KPIS = [
  { label: 'Revenue', value: '$128.4K', change: '+12.4%', up: true },
  { label: 'Proyectos', value: '14', change: '+3', up: true },
  { label: 'Clientes', value: '28', change: '+2', up: true },
  { label: 'Conversión', value: '34%', change: '+5.2%', up: true },
]

export default function DashboardPreview() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} id="demo" className="py-16 px-4 bg-surface relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-sm opacity-100 pointer-events-none" />

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
            <span className="text-accent">que construimos.</span>
          </h2>
          <p className="font-body text-muted max-w-lg mx-auto">
            Ingresá con Google y accedé al dashboard demo. Es exactamente lo que entregamos a nuestros clientes.
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
          <div className="bg-[#0d0d0d] rounded-t-lg border border-border px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 mx-4 bg-surface rounded px-3 py-1 font-mono text-xs text-muted text-center">
              app.cracker.dev/dashboard
            </div>
          </div>

          {/* Dashboard content */}
          <div className="bg-background border border-t-0 border-border rounded-b-lg overflow-hidden">
            <div className="flex">
              {/* Sidebar mini */}
              <div className="hidden sm:flex flex-col w-44 border-r border-border bg-surface p-3 gap-1">
                <div className="h-8 flex items-center px-2 mb-2">
                  <span className="font-display font-extrabold text-sm text-text">CRACKER<span className="text-accent">_</span></span>
                </div>
                {['Overview', 'Analytics', 'Proyectos', 'Reportes'].map((item, i) => (
                  <div key={item} className={`flex items-center gap-2 px-2 py-2 rounded-sm font-body text-xs ${i === 0 ? 'bg-accent/10 text-accent border-l-2 border-accent' : 'text-muted'}`}>
                    <span className="font-mono">◈</span>
                    {item}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 p-4 md:p-6 space-y-4">
                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {KPIS.map((kpi) => (
                    <div key={kpi.label} className="bg-surface border border-border rounded-sm p-3">
                      <p className="font-mono text-xs text-muted mb-1">{kpi.label}</p>
                      <p className="font-display font-bold text-xl text-text">{kpi.value}</p>
                      <p className={`font-mono text-xs mt-0.5 ${kpi.up ? 'text-accent' : 'text-red-400'}`}>{kpi.change}</p>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="bg-surface border border-border rounded-sm p-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-body text-sm text-text">Revenue mensual</p>
                    <span className="font-mono text-xs text-muted">Últimos 6 meses</span>
                  </div>
                  <ResponsiveContainer width="100%" height={140}>
                    <AreaChart data={DATA}>
                      <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="m" tick={{ fill: '#555', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#101010', border: '1px solid #242424', borderRadius: 0, fontFamily: 'DM Sans', fontSize: 12 }}
                        labelStyle={{ color: '#EBEBEB' }}
                        itemStyle={{ color: '#60a5fa' }}
                        formatter={(v: number) => [`$${(v/1000).toFixed(1)}K`, 'Revenue']}
                      />
                      <Area type="monotone" dataKey="v" stroke="#60a5fa" strokeWidth={2} fill="url(#grad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* CTA overlay bottom */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface to-transparent flex items-end justify-center pb-4">
            <Link to="/login" className="btn-primary text-sm px-8">
              Ver dashboard completo — Ingresá con Google
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
