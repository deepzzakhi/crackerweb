import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { TEAM } from '../data/team'
import ContactSection from '../components/sections/ContactSection'

export default function TeamPage() {
  useEffect(() => { document.title = 'Equipo — Cracker' }, [])

  return (
    <div className="bg-background">
      <div className="max-w-7xl mx-auto px-4 py-24 border-b border-border">
        <p className="section-label mb-4">El equipo</p>
        <h1 className="section-heading max-w-xl">Las personas<br /><span className="text-accent">detrás del código.</span></h1>
      </div>

      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {TEAM.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card p-8 flex gap-6"
            >
              <div
                className="w-20 h-20 flex-shrink-0 flex items-center justify-center font-display font-semibold text-2xl rounded-sm"
                style={{ backgroundColor: `${member.color}15`, color: member.color, border: `1px solid ${member.color}30` }}
              >
                {member.initials}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-medium text-xl text-text tracking-tight">{member.name}</h3>
                <p className="font-mono text-xs mt-1 mb-4" style={{ color: member.color }}>{member.role}</p>
                <p className="font-body text-sm text-muted leading-relaxed mb-5">{member.bio}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {member.stack.map(t => <span key={t} className="font-mono text-xs text-muted border border-border px-2 py-0.5">{t}</span>)}
                </div>
                {member.github && (
                  <div className="flex gap-4">
                    {member.linkedin && <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-muted hover:text-accent transition-colors">LinkedIn ↗</a>}
                    <a href={member.github} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-muted hover:text-accent transition-colors">GitHub ↗</a>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <ContactSection />
    </div>
  )
}
