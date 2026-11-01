import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAuthStore } from '../store/authStore'
import ElegirHorario from '../components/booking/ElegirHorario'
import { Cargando, ErrorBox, Aviso } from '../components/booking/ui'
import {
  getMeetingTypes, getAvailableDays, getSlots, bookAppointment, downloadIcs,
  errorMessage, errorStatus, type MeetingType, type Modality, type Slot, type Appointment,
} from '../services/booking'
import { hora, diaLargo, TZ_LABEL, pesos } from '../lib/fechas'

// Reserva en 3 pantallas: 1) qué, cómo y cuándo · 2) datos y confirmación · 3) listo.
// Se puede elegir el horario sin cuenta; para confirmar se entra con Google y se vuelve acá con lo elegido.

const BORRADOR = 'cracker-agendar'
interface Borrador { typeId: string; modality: Modality; slot: Slot; topic: string; company: string; phone: string }

export default function Agendar() {
  const { user, isAuthenticated } = useAuthStore()
  const real = isAuthenticated && !user?.isDemo
  const navigate = useNavigate()

  const [types, setTypes] = useState<MeetingType[]>([])
  const [typesState, setTypesState] = useState<'loading' | 'ok' | 'error'>('loading')
  const [paso, setPaso] = useState<1 | 2 | 3>(1)
  const [typeId, setTypeId] = useState('')
  const [modality, setModality] = useState<Modality>('VIRTUAL')
  const [slot, setSlot] = useState<Slot | null>(null)
  const [topic, setTopic] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [cita, setCita] = useState<Appointment | null>(null)

  useEffect(() => { document.title = 'Agendar una reunión — Cracker' }, [])
  // Cada paso arranca arriba (si no, queda scrolleado donde estaba el botón)
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [paso])

  const cargarTipos = useCallback(async () => {
    setTypesState('loading')
    try {
      const t = await getMeetingTypes()
      setTypes(t); setTypesState('ok')
      // Si vuelve del login, se recupera lo que había elegido
      let b: Borrador | null = null
      try { b = JSON.parse(sessionStorage.getItem(BORRADOR) ?? 'null') } catch { /* nada */ }
      if (b && t.some((x) => x.id === b!.typeId)) {
        setTypeId(b.typeId); setModality(b.modality); setSlot(b.slot); setTopic(b.topic); setCompany(b.company); setPhone(b.phone); setPaso(2)
      } else setTypeId((prev) => prev || t[0]?.id || '')
    } catch { setTypesState('error') }
  }, [])
  useEffect(() => { void cargarTipos() }, [cargarTipos])

  const tipo = types.find((t) => t.id === typeId)
  const loadDays = useCallback((m: string) => getAvailableDays(typeId, m), [typeId])
  const loadSlots = useCallback((d: string) => getSlots(typeId, d), [typeId])

  const irALogin = () => {
    if (slot) sessionStorage.setItem(BORRADOR, JSON.stringify({ typeId, modality, slot, topic, company, phone } satisfies Borrador))
    navigate('/login?next=/agendar')
  }

  const confirmar = async () => {
    if (!slot || enviando) return
    if (topic.trim().length < 3) { setError('Contanos en una línea qué necesitás.'); return }
    setEnviando(true); setError('')
    try {
      const c = await bookAppointment({ meetingTypeId: typeId, startsAt: slot.startsAt, modality, topic: topic.trim(), company: company.trim() || undefined, phone: phone.trim() || undefined })
      sessionStorage.removeItem(BORRADOR)
      setCita(c); setPaso(3)
    } catch (err) {
      if (errorStatus(err) === 409) {
        // Otra persona tomó el horario: se vuelve a elegir con la lista actualizada
        setSlot(null); setRefresh((r) => r + 1); setPaso(1)
      }
      if (errorStatus(err) === 401) { irALogin(); return }
      setError(errorMessage(err))
    } finally { setEnviando(false) }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
      <p className="section-label mb-3">Agenda</p>
      <h1 className="font-display font-medium text-3xl md:text-4xl text-text tracking-tight">Agendá una reunión</h1>
      <p className="font-body text-muted mt-2">Elegí el tipo de reunión y un horario libre. Te confirmamos desde el panel.</p>

      {/* Indicador de pasos */}
      <ol className="flex gap-2 mt-8 mb-8" aria-label="Pasos de la reserva">
        {['Horario', 'Tus datos', 'Listo'].map((p, i) => (
          <li key={p} aria-current={paso === i + 1 ? 'step' : undefined}
            className={clsx('flex-1 border-t-2 pt-2 font-mono text-xs uppercase tracking-wider', paso > i ? 'border-accent text-text' : 'border-border text-muted')}>
            {i + 1}. {p}
          </li>
        ))}
      </ol>

      {typesState === 'loading' && <Cargando filas={2} />}
      {typesState === 'error' && <ErrorBox mensaje="No pudimos cargar la agenda. Revisá tu conexión." onRetry={() => void cargarTipos()} />}
      {typesState === 'ok' && types.length === 0 && <Aviso tipo="info">La agenda todavía no está abierta. Escribinos por WhatsApp.</Aviso>}

      {typesState === 'ok' && tipo && paso === 1 && (
        <div className="space-y-8">
          {error && <Aviso tipo="error">{error}</Aviso>}
          <fieldset>
            <legend className="font-display font-medium text-text mb-3">¿Qué tipo de reunión?</legend>
            <div className="grid sm:grid-cols-2 gap-3">
              {types.map((t) => (
                <label key={t.id} className={clsx('card p-4 cursor-pointer flex gap-3 items-start min-h-11', t.id === typeId && 'border-accent')}>
                  <input type="radio" name="tipo" value={t.id} checked={t.id === typeId} onChange={() => { setTypeId(t.id); setSlot(null) }} className="mt-1 accent-[rgb(var(--c-accent))]" />
                  <span>
                    <span className="block font-body font-medium text-text">{t.name}</span>
                    <span className="block font-mono text-xs text-muted mt-0.5">{t.durationMin} min · {t.priceCents ? pesos(t.priceCents, t.currency) : 'Sin costo'}</span>
                    {t.description && <span className="block font-body text-sm text-muted mt-1">{t.description}</span>}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-display font-medium text-text mb-3">¿Cómo preferís?</legend>
            <div className="flex flex-wrap gap-3">
              {([['VIRTUAL', 'Virtual'], ['PRESENCIAL', 'Presencial']] as const).map(([v, l]) => (
                <label key={v} className={clsx('px-4 min-h-11 inline-flex items-center gap-2 border cursor-pointer font-body text-sm', modality === v ? 'border-accent text-text' : 'border-border text-muted')}>
                  <input type="radio" name="modalidad" value={v} checked={modality === v} onChange={() => setModality(v)} className="accent-[rgb(var(--c-accent))]" />
                  {l}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <h2 className="font-display font-medium text-text mb-3">¿Cuándo?</h2>
            <ElegirHorario key={typeId} loadDays={loadDays} loadSlots={loadSlots} value={slot} onChange={setSlot} refreshKey={refresh} />
          </div>

          <div className="flex justify-end">
            <button type="button" className="btn-primary min-h-11 disabled:opacity-40" disabled={!slot} onClick={() => { setError(''); setPaso(2) }}>
              Continuar →
            </button>
          </div>
        </div>
      )}

      {typesState === 'ok' && tipo && paso === 2 && slot && (
        <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] gap-8">
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void (real ? confirmar() : irALogin()) }}>
            {error && <Aviso tipo="error">{error}</Aviso>}
            <div>
              <label htmlFor="topic" className="block font-body text-sm text-text mb-1">¿Qué necesitás? <span className="text-muted">(obligatorio)</span></label>
              <textarea id="topic" className="input h-28 resize-none" maxLength={500} required value={topic} onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej.: quiero una tienda online para mi negocio" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company" className="block font-body text-sm text-text mb-1">Empresa <span className="text-muted">(opcional)</span></label>
                <input id="company" className="input" maxLength={120} value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" />
              </div>
              <div>
                <label htmlFor="phone" className="block font-body text-sm text-text mb-1">Teléfono <span className="text-muted">(opcional)</span></label>
                <input id="phone" className="input" maxLength={40} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 justify-between pt-2">
              <button type="button" className="btn-secondary min-h-11" onClick={() => setPaso(1)}>← Cambiar horario</button>
              {real
                ? <button type="submit" className="btn-primary min-h-11 disabled:opacity-40" disabled={enviando}>{enviando ? 'Reservando…' : 'Confirmar reserva'}</button>
                : <button type="submit" className="btn-primary min-h-11">Ingresá para confirmar →</button>}
            </div>
            {!real && <p className="font-body text-xs text-muted">Te pedimos entrar con Google para que puedas ver y cambiar tu cita después. Lo que elegiste queda guardado.</p>}
          </form>

          <aside className="card p-5 h-fit" aria-label="Resumen de la reserva">
            <p className="section-label mb-3">Resumen</p>
            <dl className="space-y-3 font-body text-sm">
              <div><dt className="text-muted">Reunión</dt><dd className="text-text">{tipo.name} · {tipo.durationMin} min</dd></div>
              <div><dt className="text-muted">Día</dt><dd className="text-text">{diaLargo(slot.startsAt)}</dd></div>
              <div><dt className="text-muted">Hora</dt><dd className="text-text">{hora(slot.startsAt)} a {hora(slot.endsAt)} <span className="text-muted">({TZ_LABEL})</span></dd></div>
              <div><dt className="text-muted">Modalidad</dt><dd className="text-text">{modality === 'VIRTUAL' ? 'Virtual' : 'Presencial'}</dd></div>
            </dl>
          </aside>
        </div>
      )}

      {paso === 3 && cita && (
        <div className="card p-6 md:p-8 max-w-xl">
          <p className="font-display font-medium text-2xl text-text">¡Listo! Recibimos tu reserva.</p>
          <p className="font-body text-muted mt-2">
            {cita.meetingType.name} el <span className="text-text">{diaLargo(cita.startsAt)}</span> a las <span className="text-text">{hora(cita.startsAt)}</span> ({TZ_LABEL}).
            Queda <span className="text-amber-300">pendiente</span> hasta que la confirmemos; lo vas a ver en Mis citas.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button type="button" className="btn-secondary min-h-11" onClick={() => void downloadIcs(cita.id)}>Agregar a mi calendario</button>
            <Link to="/cuenta" className="btn-primary min-h-11">Ver mis citas →</Link>
          </div>
        </div>
      )}
    </div>
  )
}
