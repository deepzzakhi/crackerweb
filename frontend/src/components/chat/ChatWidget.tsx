import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import api from '../../services/api'
import { whatsappLink } from '../../data/contact'

/*
 * Asistente de Cracker: responde con IA (backend /api/chat) y pasa la charla a WhatsApp Business
 * con un resumen ya escrito. Si la IA no está disponible, ofrece WhatsApp directo.
 */
const CLAVE = 'cracker-chat'
const MAX = 1000

interface Mensaje { role: 'user' | 'assistant'; content: string }

const BIENVENIDA: Mensaje = {
  role: 'assistant',
  content: '¡Hola! Soy el asistente de Cracker. Contame qué querés construir (una web, una app, un sistema) y te oriento. Cuando quieras, seguimos por WhatsApp con el equipo.',
}
const SUGERENCIAS = ['Quiero una web para mi negocio', '¿Cuánto tarda una app?', '¿Qué proyectos hicieron?']

function cargar(): Mensaje[] {
  try {
    const m = JSON.parse(sessionStorage.getItem(CLAVE) ?? '[]') as Mensaje[]
    return Array.isArray(m) && m.length ? m : [BIENVENIDA]
  } catch { return [BIENVENIDA] }
}

function linkWhatsApp(mensajes: Mensaje[]) {
  const lo = mensajes.filter((m) => m.role === 'user').map((m) => m.content).join(' / ')
  const texto = lo
    ? `Hola Cracker! Vengo del chat de la web. Les cuento: ${lo}`.slice(0, 900)
    : 'Hola Cracker! Vengo de la web y quiero consultar por un proyecto.'
  return whatsappLink(texto)
}

export default function ChatWidget() {
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState<Mensaje[]>(cargar)
  const [texto, setTexto] = useState('')
  const [pensando, setPensando] = useState(false)
  const [sinIA, setSinIA] = useState(false)
  const lista = useRef<HTMLDivElement>(null)
  const entrada = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    try { sessionStorage.setItem(CLAVE, JSON.stringify(mensajes)) } catch { /* sin storage */ }
    lista.current?.scrollTo({ top: lista.current.scrollHeight, behavior: 'smooth' })
  }, [mensajes, pensando])

  useEffect(() => { if (abierto) entrada.current?.focus() }, [abierto])

  // Esc cierra el chat
  useEffect(() => {
    if (!abierto) return
    const f = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierto(false) }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [abierto])

  const enviar = async (contenido: string) => {
    const t = contenido.trim().slice(0, MAX)
    if (!t || pensando) return
    const nuevos: Mensaje[] = [...mensajes, { role: 'user', content: t }]
    setMensajes(nuevos)
    setTexto('')
    setPensando(true)
    try {
      // Al servidor van los últimos 20 mensajes, sin el saludo inicial
      const historial = nuevos.filter((m) => m !== BIENVENIDA && !(m.role === 'assistant' && m.content === BIENVENIDA.content)).slice(-20)
      while (historial.length && historial[0]!.role !== 'user') historial.shift()
      const { data } = await api.post<{ reply: string }>('/chat', { messages: historial })
      setMensajes((m) => [...m, { role: 'assistant', content: data.reply }])
    } catch (err) {
      const r = (err as { response?: { status?: number; data?: { message?: string } } }).response
      if (!r || r.status === 503 || r.status === 502) setSinIA(true)
      setMensajes((m) => [...m, { role: 'assistant', content: r?.data?.message ?? 'No pude responder ahora. Escribinos por WhatsApp y te contesta el equipo.' }])
    } finally {
      setPensando(false)
    }
  }

  const alEnviar = (e: FormEvent) => { e.preventDefault(); void enviar(texto) }
  const reiniciar = () => { setMensajes([BIENVENIDA]); setSinIA(false) }
  const charlaIniciada = mensajes.some((m) => m.role === 'user')

  return (
    <>
      <AnimatePresence>
        {abierto && (
          <motion.section
            role="dialog"
            aria-label="Chat con Cracker"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 bottom-24 right-4 left-4 sm:left-auto sm:w-[380px] h-[min(560px,calc(100vh-8rem))] bg-surface border border-border shadow-2xl flex flex-col"
          >
            <header className="flex items-center justify-between gap-2 px-4 h-14 border-b border-border shrink-0">
              <div className="min-w-0">
                <p className="font-display font-bold text-sm text-text">Asistente Cracker</p>
                <p className="font-mono text-[10px] text-muted truncate">{sinIA ? 'Te atiende el equipo por WhatsApp' : 'Respuestas con IA · el equipo sigue por WhatsApp'}</p>
              </div>
              <div className="flex items-center gap-1">
                {charlaIniciada && (
                  <button type="button" onClick={reiniciar} className="btn-ghost px-2 py-1 text-xs" title="Empezar de nuevo">Reiniciar</button>
                )}
                <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar chat" className="w-8 h-8 inline-flex items-center justify-center text-muted hover:text-text">✕</button>
              </div>
            </header>

            <div ref={lista} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" aria-live="polite">
              {mensajes.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <p className={m.role === 'user'
                    ? 'max-w-[85%] bg-accent text-white px-3 py-2 text-sm font-body whitespace-pre-wrap'
                    : 'max-w-[85%] bg-surface-2 border border-border text-text px-3 py-2 text-sm font-body whitespace-pre-wrap'}>
                    {m.content}
                  </p>
                </div>
              ))}
              {pensando && (
                <div className="flex justify-start">
                  <p className="bg-surface-2 border border-border px-3 py-2 text-sm text-muted font-mono" aria-label="Escribiendo">
                    <span className="animate-pulse">escribiendo…</span>
                  </p>
                </div>
              )}
              {!charlaIniciada && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGERENCIAS.map((s) => (
                    <button key={s} type="button" onClick={() => void enviar(s)}
                      className="border border-border px-3 py-1.5 text-xs font-body text-muted hover:text-accent hover:border-accent transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <a href={linkWhatsApp(mensajes)} target="_blank" rel="noopener noreferrer"
              className="mx-4 mb-3 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-display font-bold text-xs tracking-widest uppercase py-2.5 transition-colors">
              <IconoWhatsApp /> Seguir por WhatsApp
            </a>

            <form onSubmit={alEnviar} className="border-t border-border p-3 flex gap-2 shrink-0">
              <textarea
                ref={entrada}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void enviar(texto) } }}
                placeholder="Escribí tu consulta…"
                aria-label="Tu mensaje"
                maxLength={MAX}
                rows={1}
                className="input flex-1 resize-none py-2 max-h-28"
              />
              <button type="submit" disabled={pensando || !texto.trim()} aria-label="Enviar"
                className="btn-primary px-4 py-2 disabled:opacity-40 disabled:hover:scale-100">
                →
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        aria-label={abierto ? 'Cerrar chat' : 'Abrir chat con Cracker'}
        aria-expanded={abierto}
        className="fixed z-50 bottom-5 right-5 w-14 h-14 rounded-full bg-accent text-white shadow-lg shadow-accent/30 inline-flex items-center justify-center hover:bg-accent-dim hover:scale-105 active:scale-95 transition-all"
      >
        {abierto ? (
          <span className="text-xl leading-none">✕</span>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </>
  )
}

function IconoWhatsApp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4C2.7 15.6 2.2 13.8 2.2 12 2.2 6.6 6.6 2.2 12 2.2c2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8zM20.5 3.5C18.2 1.2 15.2 0 12 0 5.4 0 .1 5.3.1 11.9c0 2.1.6 4.2 1.6 6L0 24l6.3-1.6c1.8 1 3.8 1.5 5.7 1.5 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.5z" />
    </svg>
  )
}
