import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { PRODUCTS } from '../../data/products'
import Badge from '../ui/Badge'

export default function Products() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} id="productos" className="py-32 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="mb-16">
          <p className="section-label mb-4">Productos propios</p>
          <h2 className="section-heading">SaaS que estamos<br /><span className="text-accent">construyendo.</span></h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRODUCTS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card p-8 flex flex-col relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${p.color}33, transparent)` }} />

              <div className="flex items-start justify-between mb-6">
                <div className="w-10 h-10 border flex items-center justify-center font-display font-bold text-sm" style={{ borderColor: `${p.color}40`, color: p.color }}>
                  {p.name.charAt(0)}
                </div>
                <Badge status={p.status} />
              </div>

              <h3 className="font-display font-bold text-xl text-text mb-1 tracking-tight">{p.name}</h3>
              <p className="font-mono text-xs mb-4" style={{ color: p.color }}>{p.tagline}</p>
              <p className="font-body text-sm text-muted leading-relaxed flex-1 mb-6">{p.description}</p>

              <ul className="space-y-1.5 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 font-body text-xs text-muted">
                    <span className="w-1 h-1 rounded-full" style={{ backgroundColor: p.color }} />
                    {f}
                  </li>
                ))}
              </ul>

              <button className="btn-secondary text-xs w-full justify-center" style={{ borderColor: `${p.color}40`, color: p.color }}>
                {p.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
