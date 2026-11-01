import { useCallback, useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import ElegirHorario from '../../components/booking/ElegirHorario'
import { Cargando, ErrorBox, Vacio, Aviso, EstadoCita } from '../../components/booking/ui'
import { admin, errorMessage, errorStatus, type AdminAppointment, type Slot } from '../../services/booking'
import { hora, diaCorto, diaLargo, diaISO, inicioDiaAR, TZ_LABEL } from '../../lib/fechas'

// Semana (lunes a domingo, hora de Argentina) en vista de grilla en desktop y lista por día en mobile
const ESTADOS = [['ALL', 'Todas'], ['PENDING', 'Pendientes'], ['CONFIRMED', 'Confirmadas'], ['CANCELLED', 'Canceladas'], ['DONE', 'Realizadas']] as const

function lunesDe(day: string) {
  const d = new Date(`${day}T12:00:00-03:00`)
  const wd = (d.getUTCDay() + 6) % 7 // 0 = lunes
  return diaISO(new Date(d.getTime() - wd * 864e5))
}
const sumarDias = (day: string, n: number) => diaISO(new Date(new Date(`${day}T12:00:00-03:00`).getTime() + n * 864e5))

export default function AdminCitas() {
  const [lunes, setLunes] = useState(() => lunesDe(diaISO(new Date())))
  const [status, setStatus] = useState<(typeof ESTADOS)[number][0]>('ALL')
  const [citas, setCitas] = useState<AdminAppointment[]>([])
  const [estado, setEstado] = useState<'loading' | 'ok' | 'error'>('loading')
  const [sel, setSel] = useState<string | null>(null)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const dias = useMemo(() => Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i)), [lunes])

  const cargar = useCallback(async () => {
    setEstado('loading')
    try {
      setCitas(await admin.appointments({ status, from: inicioDiaAR(lunes), to: inicioDiaAR(sumarDias(lunes, 7)) }))
      setEstado('ok')
    } catch { setEstado('error') }
  }, [lunes, status])
  useEffect(() => { void cargar() }, [cargar])

  const porDia = (d: string) => citas.filter((c) => diaISO(c.startsAt) === d)
  const elegida = citas.find((c) => c.id === sel) ?? null
  const pendientes = citas.filter((c) => c.status === 'PENDING').length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" className="btn-secondary px-3 min-h-11" aria-label="Semana anterior" onClick={() => setLunes(sumarDias(lunes, -7))}>←</button>
          <p className="font-body text-sm text-text min-w-[12rem] text-center">{diaCorto(`${lunes}T12:00:00-03:00`)} – {diaCorto(`${sumarDias(lunes, 6)}T12:00:00-03:00`)}</p>
          <button type="button" className="btn-secondary px-3 min-h-11" aria-label="Semana siguiente" onClick={() => setLunes(sumarDias(lunes, 7))}>→</button>
          <button type="button" className="btn-ghost min-h-11" onClick={() => setLunes(lunesDe(diaISO(new Date())))}>Hoy</button>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="f-estado" className="font-body text-sm text-muted">Estado</label>
          <select id="f-estado" className="input !w-auto min-h-11" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            {ESTADOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>
      <p className="font-mono text-xs text-muted">{TZ_LABEL}{estado === 'ok' && pendientes > 0 ? ` · ${pendientes} pendiente(s) de confirmar esta semana` : ''}</p>

      {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}
      {estado === 'loading' && <Cargando filas={4} />}
      {estado === 'error' && <ErrorBox mensaje="No pudimos cargar las citas." onRetry={() => void cargar()} />}
      {estado === 'ok' && !citas.length && <Vacio titulo="No hay citas esta semana" texto="Probá otra semana o cambiá el filtro." />}

      {estado === 'ok' && citas.length > 0 && (
        <>
          {/* Desktop: grilla semanal */}
          <div className="hidden lg:grid grid-cols-7 gap-2">
            {dias.map((d) => (
              <div key={d} className="min-w-0">
                <p className={clsx('font-mono text-xs uppercase mb-2', d === diaISO(new Date()) ? 'text-accent-light' : 'text-muted')}>{diaCorto(`${d}T12:00:00-03:00`)}</p>
                <div className="space-y-2">
                  {porDia(d).map((c) => <Tarjeta key={c.id} c={c} activa={sel === c.id} onClick={() => setSel(sel === c.id ? null : c.id)} />)}
                </div>
              </div>
            ))}
          </div>
          {/* Mobile y tablet: lista por día */}
          <div className="lg:hidden space-y-5">
            {dias.filter((d) => porDia(d).length).map((d) => (
              <section key={d}>
                <h2 className="font-display font-medium text-text mb-2">{diaLargo(`${d}T12:00:00-03:00`)}</h2>
                <div className="space-y-2">{porDia(d).map((c) => <Tarjeta key={c.id} c={c} activa={sel === c.id} onClick={() => setSel(sel === c.id ? null : c.id)} />)}</div>
              </section>
            ))}
          </div>
        </>
      )}

      {elegida && <Detalle key={elegida.id} c={elegida} onCambio={(a) => { setAviso(a); void cargar() }} />}
    </div>
  )
}

function Tarjeta({ c, activa, onClick }: { c: AdminAppointment; activa: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-expanded={activa}
      className={clsx('w-full text-left card p-3 min-h-11', activa && 'border-accent', c.status === 'CANCELLED' && 'opacity-60')}>
      <span className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm text-text">{hora(c.startsAt)}</span>
        <EstadoCita estado={c.displayStatus} />
      </span>
      <span className="block font-body text-sm text-text mt-1 truncate">{c.user.name}</span>
      <span className="block font-body text-xs text-muted truncate">{c.meetingType.name} · {c.modality === 'VIRTUAL' ? 'Virtual' : 'Presencial'}</span>
    </button>
  )
}

function Detalle({ c, onCambio }: { c: AdminAppointment; onCambio: (a: { tipo: 'ok' | 'error'; texto: string }) => void }) {
  const [notas, setNotas] = useState(c.adminNotes)
  const [guardado, setGuardado] = useState(false)
  const [mover, setMover] = useState(false)
  const [slot, setSlot] = useState<Slot | null>(null)
  const [refresh, setRefresh] = useState(0)
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState('')

  const accion = async (fn: () => Promise<unknown>, ok: string) => {
    setOcupado(true); setError('')
    try { await fn(); onCambio({ tipo: 'ok', texto: ok }) }
    catch (err) { setError(errorMessage(err)); if (errorStatus(err) === 409) { setSlot(null); setRefresh((r) => r + 1) } }
    finally { setOcupado(false) }
  }
  const loadDays = useCallback((m: string) => admin.slotsDays(c.id, m), [c.id])
  const loadSlots = useCallback((d: string) => admin.slots(c.id, d), [c.id])

  return (
    <section className="card p-5 space-y-4" aria-label="Detalle de la cita">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display font-medium text-lg text-text">{c.user.name} <span className="font-mono text-xs text-muted">{c.user.email}</span></p>
          <p className="font-body text-sm text-muted">{diaLargo(c.startsAt)} · {hora(c.startsAt)} a {hora(c.endsAt)} · {c.meetingType.name} · {c.modality === 'VIRTUAL' ? 'Virtual' : 'Presencial'}</p>
        </div>
        <EstadoCita estado={c.displayStatus} />
      </div>
      <dl className="grid sm:grid-cols-3 gap-3 font-body text-sm">
        <div className="sm:col-span-3"><dt className="text-muted">Qué necesita</dt><dd className="text-text">{c.topic || '—'}</dd></div>
        <div><dt className="text-muted">Empresa</dt><dd className="text-text">{c.company || '—'}</dd></div>
        <div><dt className="text-muted">Teléfono</dt><dd className="text-text">{c.phone || '—'}</dd></div>
      </dl>
      {error && <Aviso tipo="error">{error}</Aviso>}

      <div className="flex flex-wrap gap-2">
        {c.status === 'PENDING' && <button type="button" disabled={ocupado} className="btn-primary text-xs py-2 px-4 min-h-11" onClick={() => void accion(() => admin.confirm(c.id), 'Cita confirmada.')}>Confirmar</button>}
        {(c.status === 'PENDING' || c.status === 'CONFIRMED') && <button type="button" disabled={ocupado} className="btn-secondary text-xs py-2 px-4 min-h-11" onClick={() => setMover(!mover)}>{mover ? 'Cerrar' : 'Reprogramar'}</button>}
        {c.status === 'CONFIRMED' && <button type="button" disabled={ocupado} className="btn-secondary text-xs py-2 px-4 min-h-11" onClick={() => void accion(() => admin.done(c.id), 'Marcada como realizada.')}>Marcar realizada</button>}
        {c.status !== 'CANCELLED' && c.status !== 'DONE' && <button type="button" disabled={ocupado} className="btn-ghost text-xs min-h-11 text-red-300 hover:text-red-200" onClick={() => void accion(() => admin.cancel(c.id), 'Cita cancelada. Se avisa al cliente.')}>Cancelar cita</button>}
      </div>

      {mover && (
        <div className="border-t border-border pt-4 space-y-3">
          <ElegirHorario loadDays={loadDays} loadSlots={loadSlots} value={slot} onChange={setSlot} current={c.startsAt} refreshKey={refresh} />
          <div className="flex justify-end">
            <button type="button" className="btn-primary text-xs py-2 px-4 min-h-11 disabled:opacity-40" disabled={!slot || ocupado}
              onClick={() => slot && void accion(() => admin.reschedule(c.id, slot.startsAt), 'Cita movida y confirmada.')}>
              {slot ? `Mover al ${diaLargo(slot.startsAt)} ${hora(slot.startsAt)}` : 'Elegí un horario'}
            </button>
          </div>
        </div>
      )}

      <div className="border-t border-border pt-4">
        <label htmlFor="notas" className="block font-body text-sm text-text mb-1">Notas internas <span className="text-muted">(el cliente no las ve)</span></label>
        <textarea id="notas" className="input h-24 resize-y" maxLength={2000} value={notas} onChange={(e) => { setNotas(e.target.value); setGuardado(false) }} />
        <div className="flex items-center justify-end gap-3 mt-2">
          {guardado && <span className="font-body text-xs text-emerald-300" role="status">Guardado</span>}
          <button type="button" className="btn-secondary text-xs py-2 px-4 min-h-11" disabled={ocupado || notas === c.adminNotes && guardado}
            onClick={async () => { try { await admin.notes(c.id, notas); setGuardado(true) } catch (err) { setError(errorMessage(err)) } }}>Guardar notas</button>
        </div>
      </div>
    </section>
  )
}
