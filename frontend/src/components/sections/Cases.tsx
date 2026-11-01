import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { CASES } from '../../data/cases'

export default function Cases() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} id="casos" className="py-16 px-4 bg-surface">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="mb-8">
          <p className="section-label mb-4">Portfolio</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="section-heading">Casos de éxito</h2>
            <Link to="/casos" className="font-body text-sm text-muted hover:text-accent transition-colors">Ver todos →</Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {CASES.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="card group relative overflow-hidden p-8"
            >
              {/* Accent line top */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="font-mono text-xs text-muted">{c.category}</span>
                  <h3 className="font-display font-medium text-2xl text-text mt-1 tracking-tight">{c.title}</h3>
                  <p className="font-mono text-xs text-muted mt-0.5">{c.client}</p>
                </div>
                <div className="w-10 h-10 rounded-sm border border-border flex items-center justify-center font-display font-medium text-lg" style={{ color: c.color }}>
                  {c.title.charAt(0)}
                </div>
              </div>

              <p className="font-body text-sm text-muted leading-relaxed mb-6">{c.description}</p>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-6 border-t border-border pt-5">
                {c.metrics.map((m) => (
                  <div key={m.label}>
                    <p className="font-display font-medium text-lg" style={{ color: c.color }}>{m.value}</p>
                    <p className="font-mono text-xs text-muted mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Stack */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {c.stack.map((t) => (
                  <span key={t} className="font-mono text-xs text-muted border border-border px-2 py-0.5">{t}</span>
                ))}
              </div>

              {/* Result */}
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="font-body text-sm font-medium" style={{ color: c.color }}>{c.result}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
