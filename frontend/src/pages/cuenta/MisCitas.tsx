import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ElegirHorario from '../../components/booking/ElegirHorario'
import { Cargando, ErrorBox, Vacio, Aviso, EstadoCita } from '../../components/booking/ui'
import {
  getMyAppointments, cancelMyAppointment, rescheduleMyAppointment, getAvailableDays, getSlots, downloadIcs,
  errorMessage, errorStatus, type Appointment, type Slot,
} from '../../services/booking'
import { hora, diaLargo, TZ_LABEL } from '../../lib/fechas'

export default function MisCitas() {
  const [citas, setCitas] = useState<Appointment[]>([])
  const [limite, setLimite] = useState(24)
  const [estado, setEstado] = useState<'loading' | 'ok' | 'error'>('loading')
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const cargar = useCallback(async () => {
    setEstado('loading')
    try { const r = await getMyAppointments(); setCitas(r.data); setLimite(r.changeLimitHours); setEstado('ok') }
    catch { setEstado('error') }
  }, [])
  useEffect(() => { void cargar() }, [cargar])

  const ahora = Date.now()
  const proximas = citas.filter((c) => new Date(c.endsAt).getTime() >= ahora && c.status !== 'CANCELLED').sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  const resto = citas.filter((c) => !proximas.includes(c))

  if (estado === 'loading') return <Cargando />
  if (estado === 'error') return <ErrorBox mensaje="No pudimos cargar tus citas." onRetry={() => void cargar()} />
  if (!citas.length) return <Vacio titulo="Todavía no tenés citas" texto="Agendá una reunión y la vas a ver acá." accion={<Link to="/agendar" className="btn-primary min-h-11">Agendar reunión</Link>} />

  return (
    <div className="space-y-8">
      {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}
      <section aria-labelledby="t-prox">
        <h2 id="t-prox" className="font-display font-medium text-text mb-3">Próximas</h2>
        {proximas.length ? (
          <ul className="space-y-3">
            {proximas.map((c) => <CitaItem key={c.id} cita={c} limite={limite} onCambio={(t) => { setAviso(t); void cargar() }} />)}
          </ul>
        ) : <p className="font-body text-sm text-muted">No tenés citas próximas.</p>}
      </section>
      {resto.length > 0 && (
        <section aria-labelledby="t-hist">
          <h2 id="t-hist" className="font-display font-medium text-text mb-3">Anteriores y canceladas</h2>
          <ul className="space-y-3">{resto.map((c) => <CitaItem key={c.id} cita={c} limite={limite} />)}</ul>
        </section>
      )}
    </div>
  )
}

function CitaItem({ cita, limite, onCambio }: { cita: Appointment; limite: number; onCambio?: (a: { tipo: 'ok' | 'error'; texto: string }) => void }) {
  const [modo, setModo] = useState<'ver' | 'cancelar' | 'reprogramar'>('ver')
  const [slot, setSlot] = useState<Slot | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(0)
  const activa = cita.status === 'PENDING' || cita.status === 'CONFIRMED'
  const editable = activa && new Date(cita.startsAt).getTime() - Date.now() > limite * 3600_000
  const tipo = cita.meetingType.id

  const loadDays = useCallback((m: string) => getAvailableDays(tipo, m, cita.id), [tipo, cita.id])
  const loadSlots = useCallback((d: string) => getSlots(tipo, d, cita.id), [tipo, cita.id])

  const cancelar = async () => {
    setEnviando(true); setError('')
    try { await cancelMyAppointment(cita.id); onCambio?.({ tipo: 'ok', texto: 'Cancelaste la cita.' }) }
    catch (err) { setError(errorMessage(err)) } finally { setEnviando(false) }
  }
  const reprogramar = async () => {
    if (!slot) return
    setEnviando(true); setError('')
    try { await rescheduleMyAppointment(cita.id, slot.startsAt); onCambio?.({ tipo: 'ok', texto: 'Cambiaste el horario. Queda pendiente hasta que la confirmemos.' }) }
    catch (err) { setError(errorMessage(err)); if (errorStatus(err) === 409) { setSlot(null); setRefresh((r) => r + 1) } }
    finally { setEnviando(false) }
  }

  return (
    <li className="card p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-body font-medium text-text">{diaLargo(cita.startsAt)} · {hora(cita.startsAt)} <span className="font-mono text-xs text-muted">({TZ_LABEL})</span></p>
          <p className="font-body text-sm text-muted mt-0.5">{cita.meetingType.name} · {cita.meetingType.durationMin} min · {cita.modality === 'VIRTUAL' ? 'Virtual' : 'Presencial'}</p>
          {cita.topic && <p className="font-body text-sm text-text mt-2">{cita.topic}</p>}
        </div>
        <EstadoCita estado={cita.displayStatus} />
      </div>

      {error && <div className="mt-3"><Aviso tipo="error">{error}</Aviso></div>}

      {activa && modo === 'ver' && (
        <div className="flex flex-wrap gap-2 mt-4">
          <button type="button" className="btn-secondary text-xs py-2 px-4 min-h-11" onClick={() => void downloadIcs(cita.id)}>Agregar a mi calendario</button>
          {editable ? (
            <>
              <button type="button" className="btn-secondary text-xs py-2 px-4 min-h-11" onClick={() => setModo('reprogramar')}>Reprogramar</button>
              <button type="button" className="btn-ghost text-xs min-h-11 text-red-300 hover:text-red-200" onClick={() => setModo('cancelar')}>Cancelar</button>
            </>
          ) : <p className="font-body text-xs text-muted self-center">Faltan menos de {limite} h: para cambiarla escribinos por WhatsApp.</p>}
        </div>
      )}

      {modo === 'cancelar' && (
        <div className="mt-4 border border-red-500/40 p-4 flex flex-wrap items-center justify-between gap-3">
          <p className="font-body text-sm text-text">¿Seguro que querés cancelar esta cita?</p>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary text-xs py-2 px-4 min-h-11" onClick={() => setModo('ver')} disabled={enviando}>No, volver</button>
            <button type="button" className="btn-primary text-xs py-2 px-4 min-h-11 !bg-red-600 hover:!bg-red-700" onClick={() => void cancelar()} disabled={enviando}>{enviando ? 'Cancelando…' : 'Sí, cancelar'}</button>
          </div>
        </div>
      )}

      {modo === 'reprogramar' && (
        <div className="mt-4 border-t border-border pt-4 space-y-4">
          <p className="font-body text-sm text-muted">Elegí el nuevo horario. Tu cita actual está marcada en el calendario.</p>
          <ElegirHorario loadDays={loadDays} loadSlots={loadSlots} value={slot} onChange={setSlot} current={cita.startsAt} refreshKey={refresh} />
          <div className="flex flex-wrap gap-2 justify-end">
            <button type="button" className="btn-secondary text-xs py-2 px-4 min-h-11" onClick={() => { setModo('ver'); setSlot(null) }} disabled={enviando}>Volver</button>
            <button type="button" className="btn-primary text-xs py-2 px-4 min-h-11 disabled:opacity-40" disabled={!slot || enviando} onClick={() => void reprogramar()}>
              {enviando ? 'Guardando…' : slot ? `Pasar al ${diaLargo(slot.startsAt)} a las ${hora(slot.startsAt)}` : 'Elegí un horario'}
            </button>
          </div>
        </div>
      )}
    </li>
  )
}
