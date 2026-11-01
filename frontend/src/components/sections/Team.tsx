import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { TEAM } from '../../data/team'

export default function Team() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} id="equipo" className="py-32 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="mb-16">
          <p className="section-label mb-4">El equipo</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="section-heading">Quiénes somos</h2>
            <Link to="/equipo" className="font-body text-sm text-muted hover:text-accent transition-colors">Ver todos →</Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card p-6 group"
            >
              {/* Avatar */}
              <div
                className="w-16 h-16 rounded-sm flex items-center justify-center font-display font-semibold text-xl mb-5 transition-all duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${member.color}15`, color: member.color, border: `1px solid ${member.color}30` }}
              >
                {member.initials}
              </div>

              <h3 className="font-display font-medium text-base text-text tracking-tight">{member.name}</h3>
              <p className="font-mono text-xs mt-1 mb-4" style={{ color: member.color }}>{member.role}</p>
              <p className="font-body text-xs text-muted leading-relaxed mb-4">{member.bio}</p>

              <div className="flex flex-wrap gap-1">
                {member.stack.slice(0, 3).map((t) => (
                  <span key={t} className="font-mono text-xs text-muted border border-border px-1.5 py-0.5">{t}</span>
                ))}
              </div>

              {member.github && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-muted hover:text-accent transition-colors">LinkedIn</a>
                  )}
                  <a href={member.github} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-muted hover:text-accent transition-colors">GitHub</a>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
