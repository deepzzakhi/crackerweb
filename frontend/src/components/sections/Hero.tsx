import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const FADE = { hidden: { opacity: 0, y: 20 }, show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] } }) }

export default function Hero() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden bg-background py-20 md:py-28">
      <div className="absolute inset-0 bg-grid opacity-100 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 text-center">
        <motion.p custom={0} variants={FADE} initial="hidden" animate="show"
          className="section-label mb-6 inline-flex items-center gap-3"
        >
          <span className="w-6 h-px bg-accent-light/60" />
          Empresa de desarrollo de software
          <span className="w-6 h-px bg-accent-light/60" />
        </motion.p>

        <motion.h1 custom={1} variants={FADE} initial="hidden" animate="show"
          className="font-display font-semibold text-4xl sm:text-6xl md:text-7xl leading-tight tracking-tight text-text mb-5"
        >
          Construimos el software<br />
          que tu negocio necesita.
        </motion.h1>

        <motion.p custom={2} variants={FADE} initial="hidden" animate="show"
          className="font-body text-base md:text-lg text-muted max-w-xl mx-auto mb-8 leading-relaxed"
        >
          Webs, sistemas a medida, automatizaciones y reportes para tu negocio.
        </motion.p>

        <motion.div custom={3} variants={FADE} initial="hidden" animate="show"
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <Link to="/login" className="btn-primary px-8 py-3 text-sm">
            Ver demo en vivo →
          </Link>
          <Link to="/contacto" className="btn-secondary px-8 py-3 text-sm">
            Hablar con el equipo
          </Link>
        </motion.div>

        <motion.div custom={4} variants={FADE} initial="hidden" animate="show"
          className="mt-14 flex flex-wrap justify-center gap-8 md:gap-16"
        >
          {[
            { n: '40+', label: 'Proyectos' },
            { n: '3', label: 'Años' },
            { n: '28', label: 'Clientes' },
            { n: '100%', label: 'On-time' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display font-semibold text-3xl md:text-4xl text-accent-light">{s.n}</p>
              <p className="font-mono text-xs text-muted mt-1 tracking-wider uppercase">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
