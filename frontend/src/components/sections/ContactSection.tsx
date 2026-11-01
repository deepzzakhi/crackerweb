import { useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import api from '../../services/api'
import { EMAIL, WHATSAPP_LABEL, whatsappLink } from '../../data/contact'

const PROJECT_TYPES = ['Desarrollo Web', 'App Mobile', 'Producto SaaS', 'Dashboard / Analytics', 'Consultoría', 'Otro']

export default function ContactSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  // `website` es un campo trampa oculto: si llega completo, es un bot y el servidor lo rechaza
  const [form, setForm] = useState({ name: '', email: '', projectType: '', message: '', website: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.projectType || !form.message) {
      setError('Completá todos los campos')
      return
    }
    setSending(true)
    setError('')
    try {
      await api.post('/contact', form)
      setSent(true)
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status
      setError(status === 429 ? 'Enviaste varios mensajes seguidos. Probá más tarde.'
        : status === 400 ? 'Revisá los datos: el mensaje necesita al menos 10 caracteres.'
        : 'No se pudo enviar. Probá de nuevo en un minuto.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section ref={ref} id="contacto" className="py-16 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="mb-16 text-center">
          <p className="section-label mb-4">Hablemos</p>
          <h2 className="section-heading">¿Tenés un proyecto?<br /><span className="text-accent">Arrancamos hoy.</span></h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -24 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }}>
            {sent ? (
              <div className="card p-10 text-center">
                <p className="font-display font-medium text-4xl text-accent mb-3">✓</p>
                <p className="font-body text-text mb-2">Mensaje recibido.</p>
                <p className="font-body text-sm text-muted">Te contactamos en menos de 24hs.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="font-mono text-xs text-red-400 border border-red-800/40 bg-red-900/10 px-4 py-2">{error}</p>}
                <input
                  className="input" placeholder="Tu nombre"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                />
                <input
                  type="email" className="input" placeholder="tu@email.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                />
                <select
                  className="input appearance-none"
                  value={form.projectType} onChange={e => setForm({ ...form, projectType: e.target.value })}
                >
                  <option value="" disabled>Tipo de proyecto</option>
                  {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <textarea
                  className="input h-32 resize-none" placeholder="Contanos de tu proyecto..." maxLength={5000}
                  value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                />
                <input
                  type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                  value={form.website} onChange={e => setForm({ ...form, website: e.target.value })}
                />
                <button type="submit" className="btn-primary w-full justify-center" disabled={sending}>
                  {sending ? 'Enviando...' : 'Enviar mensaje →'}
                </button>
              </form>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 24 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }} className="flex flex-col justify-center gap-8">
            <div>
              <p className="section-label mb-3">Respuesta rápida</p>
              <p className="font-body text-muted text-sm leading-relaxed">
                Respondemos todas las consultas en menos de 24 horas. Primera reunión de discovery sin costo.
              </p>
            </div>
            <div className="border-t border-border pt-5">
              <p className="font-mono text-xs text-muted mb-1">Email</p>
              <a href={`mailto:${EMAIL}`} className="font-body text-sm text-text hover:text-accent transition-colors">{EMAIL}</a>
            </div>
            <div className="border-t border-border pt-5">
              <p className="font-mono text-xs text-muted mb-1">WhatsApp</p>
              <a href={whatsappLink('Hola Cracker! Vengo de la web y quiero consultar por un proyecto.')} target="_blank" rel="noopener noreferrer"
                className="font-body text-sm text-text hover:text-accent transition-colors">{WHATSAPP_LABEL} ↗</a>
            </div>
            <div className="border-t border-border pt-5">
              <p className="font-mono text-xs text-muted mb-1">Reunión</p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-body text-sm text-text">Agendá una cita con el equipo</p>
                {/* Por ahora la cita se coordina por WhatsApp; después va al flujo de agenda con cuenta */}
                <a href={whatsappLink('Hola Cracker! Quiero agendar una reunión para contarles mi proyecto.')} target="_blank" rel="noopener noreferrer"
                  className="btn-secondary text-xs py-2 px-4">Agendar →</a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
