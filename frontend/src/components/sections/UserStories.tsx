import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { USER_STORIES } from '../../data/cases'

export default function UserStories() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-16 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="mb-16 text-center">
          <p className="section-label mb-4">Historias de usuarios</p>
          <h2 className="section-heading">Lo que dicen<br /><span className="text-accent">nuestros clientes.</span></h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {USER_STORIES.map((story, i) => (
            <motion.div
              key={story.author}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="card p-8 flex flex-col"
            >
              {/* Quote */}
              <span className="font-display text-5xl text-accent/20 leading-none mb-4">"</span>
              <p className="font-body text-sm text-muted leading-relaxed flex-1 mb-6">
                {story.quote}
              </p>

              {/* Result badge */}
              <div className="inline-flex items-center gap-2 border border-accent/20 bg-accent/5 px-3 py-1.5 mb-6 self-start">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="font-mono text-xs text-accent">{story.result}</span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-border pt-5">
                <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center font-display font-medium text-xs text-accent">
                  {story.avatar}
                </div>
                <div>
                  <p className="font-body text-sm font-medium text-text">{story.author}</p>
                  <p className="font-mono text-xs text-muted">{story.role} · {story.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
