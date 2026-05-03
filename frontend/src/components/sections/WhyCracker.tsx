import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const REASONS = [
  { icon: '◈', title: 'Código que dura', desc: 'TypeScript strict, tests, documentación. Entregamos bases de código que tu equipo puede mantener sin nosotros.' },
  { icon: '◉', title: 'Entregas predecibles', desc: 'Sprints semanales con demos. Sabés exactamente dónde está el proyecto en todo momento. Sin sorpresas.' },
  { icon: '◆', title: 'Stack moderno real', desc: 'React, Next.js, Node.js, Prisma, Docker. No tecnologías legacy. Arquitecturas que escalan.' },
  { icon: '◇', title: 'Diseño incluido', desc: 'UI/UX profesional en cada proyecto. No entregamos wireframes grises — entregamos interfaces que los usuarios aman.' },
  { icon: '▲', title: 'Pensamos en el negocio', desc: 'No solo ejecutamos tickets. Cuestionamos, proponemos y optimizamos para el resultado de negocio, no solo el técnico.' },
  { icon: '●', title: 'Soporte post-launch', desc: 'El producto no termina en el deploy. Mantenimiento, updates y evolución continua del software que construimos.' },
]

export default function WhyCracker() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-32 px-4 bg-surface relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-sm pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="mb-16">
          <p className="section-label mb-4">Diferenciadores</p>
          <h2 className="section-heading">¿Por qué Cracker?</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {REASONS.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="bg-surface p-8 group hover:bg-background transition-colors duration-300"
            >
              <span className="font-mono text-2xl text-accent/30 group-hover:text-accent transition-colors duration-300 block mb-5">{r.icon}</span>
              <h3 className="font-display font-bold text-lg text-text mb-3 tracking-tight">{r.title}</h3>
              <p className="font-body text-sm text-muted leading-relaxed">{r.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Números grandes */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {[
            { n: '40+', desc: 'Proyectos lanzados en producción' },
            { n: '3', desc: 'Años construyendo software real' },
            { n: '28', desc: 'Clientes en Argentina y Latam' },
            { n: '< 1s', desc: 'Tiempo de carga promedio' },
          ].map((s) => (
            <div key={s.desc}>
              <p className="font-display font-extrabold text-5xl md:text-7xl text-accent/10 leading-none">{s.n}</p>
              <p className="font-mono text-xs text-muted mt-3 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
