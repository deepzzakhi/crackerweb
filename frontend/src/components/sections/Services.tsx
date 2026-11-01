import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { SERVICES } from '../../data/services'

export default function Services() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} id="servicios" className="py-16 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="mb-8">
          <p className="section-label mb-4">Lo que hacemos</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="section-heading">Servicios</h2>
            <Link to="/servicios" className="font-body text-sm text-muted hover:text-accent transition-colors flex items-center gap-1">
              Ver proceso completo →
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="bg-background p-8 md:p-10 group hover:bg-surface transition-colors duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <span className="font-mono text-3xl text-accent/40 group-hover:text-accent transition-colors duration-300">{s.icon}</span>
                <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="font-display font-medium text-2xl text-text mb-3 tracking-tight">{s.title}</h3>
              <p className="font-body text-muted text-sm leading-relaxed mb-6">{s.short}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {s.stack.slice(0, 4).map((tech) => (
                  <span key={tech} className="font-mono text-xs text-muted border border-border px-2 py-0.5">{tech}</span>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <Link to={`/servicios#${s.id}`} className="font-body text-sm text-accent hover:text-accent-dim transition-colors flex items-center gap-1">
                  Ver detalle →
                </Link>
                <span className="font-mono text-xs text-muted">{s.timeline}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
