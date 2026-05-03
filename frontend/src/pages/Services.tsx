import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { SERVICES, PROCESS } from '../data/services'
import ContactSection from '../components/sections/ContactSection'

export default function Services() {
  useEffect(() => { document.title = 'Servicios — Cracker' }, [])

  return (
    <div className="bg-background">
      <section className="py-24 px-4 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <p className="section-label mb-4">Lo que hacemos</p>
          <h1 className="section-heading max-w-2xl">Servicios de<br /><span className="text-accent">desarrollo.</span></h1>
        </div>
      </section>

      {/* Servicios detalle */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto space-y-24">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.id}
              id={s.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-start ${i % 2 === 1 ? 'md:grid-flow-dense' : ''}`}
            >
              <div className={i % 2 === 1 ? 'md:col-start-2' : ''}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="font-mono text-3xl text-accent">{s.icon}</span>
                  <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h2 className="font-display font-bold text-4xl text-text tracking-tight mb-4">{s.title}</h2>
                <p className="font-body text-muted leading-relaxed mb-8">{s.description}</p>
                <div className="flex items-center gap-4 mb-8">
                  <span className="font-mono text-xs text-muted border border-border px-3 py-1.5">Timeline: {s.timeline}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {s.stack.map(t => <span key={t} className="font-mono text-xs text-muted border border-border px-2 py-1">{t}</span>)}
                </div>
              </div>

              <div className={i % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}>
                <div className="card p-6">
                  <p className="font-mono text-xs text-muted mb-4 tracking-wider">ENTREGABLES</p>
                  <ul className="space-y-3">
                    {s.deliverables.map(d => (
                      <li key={d} className="flex items-center gap-3 font-body text-sm text-text">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Proceso */}
      <section className="py-24 px-4 bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto">
          <p className="section-label mb-4">Cómo trabajamos</p>
          <h2 className="section-heading mb-16">Proceso</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {PROCESS.map((step) => (
              <div key={step.step} className="relative">
                <p className="font-display font-extrabold text-6xl text-accent/10 leading-none mb-4">{step.step}</p>
                <h3 className="font-display font-bold text-lg text-text mb-2">{step.title}</h3>
                <p className="font-body text-xs text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactSection />
    </div>
  )
}
