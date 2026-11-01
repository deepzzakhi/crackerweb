import { useCallback, useEffect, useState } from 'react'
import { Cargando, ErrorBox, Aviso } from '../../components/booking/ui'
import { admin, errorMessage, type AvailabilityException, type MeetingType } from '../../services/booking'
import { minutosAHora, horaAMinutos, diaLargo, hora, TZ_LABEL } from '../../lib/fechas'

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const ORDEN = [1, 2, 3, 4, 5, 6, 0] // la semana arranca el lunes

interface Fila { activo: boolean; desde: string; hasta: string }

export default function AdminDisponibilidad() {
  return (
    <div className="space-y-10">
      <Horarios />
      <Bloqueos />
      <Tipos />
    </div>
  )
}

// ─── Horario semanal (una franja por día + duración de turno y descanso comunes) ───
function Horarios() {
  const [filas, setFilas] = useState<Record<number, Fila>>({})
  const [slotMin, setSlotMin] = useState(30)
  const [bufferMin, setBufferMin] = useState(10)
  const [estado, setEstado] = useState<'loading' | 'ok' | 'error'>('loading')
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
  const [guardando, setGuardando] = useState(false)

  const cargar = useCallback(async () => {
    setEstado('loading')
    try {
      const rules = await admin.availability()
      const f: Record<number, Fila> = {}
      for (const d of ORDEN) f[d] = { activo: false, desde: '09:00', hasta: '20:00' }
      for (const r of rules) f[r.weekday] = { activo: true, desde: minutosAHora(r.startMin), hasta: minutosAHora(r.endMin) }
      if (rules[0]) { setSlotMin(rules[0].slotMin); setBufferMin(rules[0].bufferMin) }
      setFilas(f); setEstado('ok')
    } catch { setEstado('error') }
  }, [])
  useEffect(() => { void cargar() }, [cargar])

  const guardar = async () => {
    const rules = ORDEN.filter((d) => filas[d]?.activo).map((d) => ({ weekday: d, startMin: horaAMinutos(filas[d]!.desde), endMin: horaAMinutos(filas[d]!.hasta), slotMin, bufferMin }))
    if (rules.some((r) => r.endMin <= r.startMin)) { setAviso({ tipo: 'error', texto: 'En algún día la hora de cierre es anterior a la de apertura.' }); return }
    setGuardando(true)
    try { await admin.saveAvailability(rules); setAviso({ tipo: 'ok', texto: 'Horario guardado.' }) }
    catch (err) { setAviso({ tipo: 'error', texto: errorMessage(err) }) } finally { setGuardando(false) }
  }
  const set = (d: number, p: Partial<Fila>) => setFilas((f) => ({ ...f, [d]: { ...f[d]!, ...p } }))

  return (
    <section aria-labelledby="t-horario" className="space-y-4">
      <div><h2 id="t-horario" className="font-display font-medium text-xl text-text">Horario de atención</h2><p className="font-body text-sm text-muted">{TZ_LABEL}. Solo se ofrecen turnos dentro de estas franjas.</p></div>
      {estado === 'loading' && <Cargando filas={3} />}
      {estado === 'error' && <ErrorBox mensaje="No pudimos cargar el horario." onRetry={() => void cargar()} />}
      {estado === 'ok' && (
        <>
          {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}
          <div className="border border-border divide-y divide-border">
            {ORDEN.map((d) => (
              <div key={d} className="flex flex-wrap items-center gap-3 p-3">
                <label className="flex items-center gap-2 min-w-[9rem] min-h-11 font-body text-sm text-text cursor-pointer">
                  <input type="checkbox" checked={filas[d]?.activo ?? false} onChange={(e) => set(d, { activo: e.target.checked })} className="w-5 h-5 accent-[rgb(var(--c-accent))]" />
                  {DIAS[d]}
                </label>
                {filas[d]?.activo ? (
                  <div className="flex items-center gap-2">
                    <label className="sr-only" htmlFor={`desde-${d}`}>Desde ({DIAS[d]})</label>
                    <input id={`desde-${d}`} type="time" step={900} className="input !w-auto min-h-11" value={filas[d]!.desde} onChange={(e) => set(d, { desde: e.target.value })} />
                    <span className="text-muted">a</span>
                    <label className="sr-only" htmlFor={`hasta-${d}`}>Hasta ({DIAS[d]})</label>
                    <input id={`hasta-${d}`} type="time" step={900} className="input !w-auto min-h-11" value={filas[d]!.hasta} onChange={(e) => set(d, { hasta: e.target.value })} />
                  </div>
                ) : <span className="font-body text-sm text-muted">No atendés</span>}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label htmlFor="slot" className="block font-body text-sm text-text mb-1">Turnos cada (min)</label>
              <input id="slot" type="number" min={5} max={240} step={5} className="input !w-28 min-h-11" value={slotMin} onChange={(e) => setSlotMin(Number(e.target.value))} />
            </div>
            <div>
              <label htmlFor="buffer" className="block font-body text-sm text-text mb-1">Descanso entre citas (min)</label>
              <input id="buffer" type="number" min={0} max={120} step={5} className="input !w-28 min-h-11" value={bufferMin} onChange={(e) => setBufferMin(Number(e.target.value))} />
            </div>
            <button type="button" className="btn-primary min-h-11 ml-auto" disabled={guardando} onClick={() => void guardar()}>{guardando ? 'Guardando…' : 'Guardar horario'}</button>
          </div>
        </>
      )}
    </section>
  )
}

// ─── Bloqueos (vacaciones, feriados) ───
function Bloqueos() {
  const [lista, setLista] = useState<AvailabilityException[]>([])
  const [estado, setEstado] = useState<'loading' | 'ok' | 'error'>('loading')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [motivo, setMotivo] = useState('')
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const cargar = useCallback(async () => {
    setEstado('loading')
    try { setLista(await admin.exceptions()); setEstado('ok') } catch { setEstado('error') }
  }, [])
  useEffect(() => { void cargar() }, [cargar])

  const agregar = async () => {
    if (!desde || !hasta || hasta < desde) { setAviso({ tipo: 'error', texto: 'Elegí la fecha de inicio y la de fin (puede ser el mismo día).' }); return }
    try {
      // Días completos en hora de Argentina: desde las 00:00 del primero hasta las 00:00 del día siguiente al último
      const fin = new Date(new Date(`${hasta}T00:00:00-03:00`).getTime() + 864e5).toISOString()
      const r = await admin.addException({ startsAt: new Date(`${desde}T00:00:00-03:00`).toISOString(), endsAt: fin, reason: motivo.trim() })
      setAviso(r.affectedAppointments
        ? { tipo: 'error', texto: `Bloqueo guardado. Ojo: hay ${r.affectedAppointments} cita(s) activas en esas fechas; revisalas en Citas.` }
        : { tipo: 'ok', texto: 'Bloqueo guardado.' })
      setDesde(''); setHasta(''); setMotivo(''); void cargar()
    } catch (err) { setAviso({ tipo: 'error', texto: errorMessage(err) }) }
  }

  return (
    <section aria-labelledby="t-bloqueos" className="space-y-4">
      <div><h2 id="t-bloqueos" className="font-display font-medium text-xl text-text">Días bloqueados</h2><p className="font-body text-sm text-muted">Vacaciones, feriados o días que no atendés. Esos días no se ofrecen turnos.</p></div>
      {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}
      <div className="flex flex-wrap items-end gap-3">
        <div><label htmlFor="b-desde" className="block font-body text-sm text-text mb-1">Desde</label><input id="b-desde" type="date" className="input !w-auto min-h-11" value={desde} onChange={(e) => { setDesde(e.target.value); if (!hasta) setHasta(e.target.value) }} /></div>
        <div><label htmlFor="b-hasta" className="block font-body text-sm text-text mb-1">Hasta</label><input id="b-hasta" type="date" className="input !w-auto min-h-11" value={hasta} min={desde} onChange={(e) => setHasta(e.target.value)} /></div>
        <div className="flex-1 min-w-[12rem]"><label htmlFor="b-motivo" className="block font-body text-sm text-text mb-1">Motivo</label><input id="b-motivo" className="input min-h-11" maxLength={200} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej.: vacaciones" /></div>
        <button type="button" className="btn-primary min-h-11" onClick={() => void agregar()}>Bloquear</button>
      </div>
      {estado === 'loading' && <Cargando filas={2} />}
      {estado === 'error' && <ErrorBox mensaje="No pudimos cargar los bloqueos." onRetry={() => void cargar()} />}
      {estado === 'ok' && (lista.length ? (
        <ul className="border border-border divide-y divide-border">
          {lista.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
              <span className="font-body text-sm text-text">{diaLargo(b.startsAt)} → {diaLargo(new Date(new Date(b.endsAt).getTime() - 1).toISOString())}{hora(b.startsAt) !== '00:00' ? ` (desde ${hora(b.startsAt)})` : ''} {b.reason && <span className="text-muted">· {b.reason}</span>}</span>
              <button type="button" className="btn-ghost text-xs min-h-11 text-red-300" onClick={async () => { try { await admin.removeException(b.id); void cargar() } catch (err) { setAviso({ tipo: 'error', texto: errorMessage(err) }) } }}>Quitar</button>
            </li>
          ))}
        </ul>
      ) : <p className="font-body text-sm text-muted">No hay días bloqueados.</p>)}
    </section>
  )
}

// ─── Tipos de reunión ───
function Tipos() {
  const [tipos, setTipos] = useState<MeetingType[]>([])
  const [estado, setEstado] = useState<'loading' | 'ok' | 'error'>('loading')
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
  const [nuevo, setNuevo] = useState({ name: '', durationMin: 30 })

  const cargar = useCallback(async () => {
    setEstado('loading')
    try { setTipos(await admin.types()); setEstado('ok') } catch { setEstado('error') }
  }, [])
  useEffect(() => { void cargar() }, [cargar])

  const guardar = async (t: MeetingType) => {
    try { await admin.updateType(t.id, { name: t.name, durationMin: t.durationMin, active: t.active, description: t.description }); setAviso({ tipo: 'ok', texto: `"${t.name}" guardado.` }) }
    catch (err) { setAviso({ tipo: 'error', texto: errorMessage(err) }) }
  }
  const crear = async () => {
    const slug = nuevo.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
    if (nuevo.name.trim().length < 2 || slug.length < 2) { setAviso({ tipo: 'error', texto: 'Poné un nombre para el tipo de reunión.' }); return }
    try { await admin.createType({ name: nuevo.name.trim(), slug, durationMin: nuevo.durationMin, sortOrder: tipos.length + 1 }); setNuevo({ name: '', durationMin: 30 }); void cargar() }
    catch (err) { setAviso({ tipo: 'error', texto: errorMessage(err) }) }
  }
  const set = (id: string, p: Partial<MeetingType>) => setTipos((ts) => ts.map((t) => (t.id === id ? { ...t, ...p } : t)))

  return (
    <section aria-labelledby="t-tipos" className="space-y-4">
      <div><h2 id="t-tipos" className="font-display font-medium text-xl text-text">Tipos de reunión</h2><p className="font-body text-sm text-muted">Lo que el cliente elige al reservar. Los inactivos no se ofrecen.</p></div>
      {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}
      {estado === 'loading' && <Cargando filas={2} />}
      {estado === 'error' && <ErrorBox mensaje="No pudimos cargar los tipos de reunión." onRetry={() => void cargar()} />}
      {estado === 'ok' && (
        <ul className="border border-border divide-y divide-border">
          {tipos.map((t) => (
            <li key={t.id} className="flex flex-wrap items-end gap-3 p-3">
              <div className="flex-1 min-w-[12rem]"><label htmlFor={`n-${t.id}`} className="block font-body text-xs text-muted mb-1">Nombre</label><input id={`n-${t.id}`} className="input min-h-11" value={t.name} maxLength={80} onChange={(e) => set(t.id, { name: e.target.value })} /></div>
              <div><label htmlFor={`d-${t.id}`} className="block font-body text-xs text-muted mb-1">Duración (min)</label><input id={`d-${t.id}`} type="number" min={10} max={240} step={5} className="input !w-28 min-h-11" value={t.durationMin} onChange={(e) => set(t.id, { durationMin: Number(e.target.value) })} /></div>
              <label className="flex items-center gap-2 min-h-11 font-body text-sm text-text cursor-pointer"><input type="checkbox" className="w-5 h-5 accent-[rgb(var(--c-accent))]" checked={t.active ?? true} onChange={(e) => set(t.id, { active: e.target.checked })} />Activo</label>
              <button type="button" className="btn-secondary text-xs py-2 px-4 min-h-11" onClick={() => void guardar(t)}>Guardar</button>
            </li>
          ))}
          <li className="flex flex-wrap items-end gap-3 p-3 bg-surface">
            <div className="flex-1 min-w-[12rem]"><label htmlFor="n-nuevo" className="block font-body text-xs text-muted mb-1">Nuevo tipo</label><input id="n-nuevo" className="input min-h-11" placeholder="Ej.: Soporte técnico" value={nuevo.name} maxLength={80} onChange={(e) => setNuevo({ ...nuevo, name: e.target.value })} /></div>
            <div><label htmlFor="d-nuevo" className="block font-body text-xs text-muted mb-1">Duración (min)</label><input id="d-nuevo" type="number" min={10} max={240} step={5} className="input !w-28 min-h-11" value={nuevo.durationMin} onChange={(e) => setNuevo({ ...nuevo, durationMin: Number(e.target.value) })} /></div>
            <button type="button" className="btn-primary text-xs py-2 px-4 min-h-11" onClick={() => void crear()}>Agregar</button>
          </li>
        </ul>
      )}
    </section>
  )
}
