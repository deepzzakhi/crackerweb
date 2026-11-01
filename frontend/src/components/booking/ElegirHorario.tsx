import { useCallback, useEffect, useState } from 'react'
import clsx from 'clsx'
import Calendario from './Calendario'
import { Skeleton, ErrorBox } from './ui'
import type { Slot } from '../../services/booking'
import { errorMessage } from '../../services/booking'
import { hora, diaLargo, diaADate, mesISO, TZ_LABEL } from '../../lib/fechas'

// Mes para elegir el día + lista de horarios libres de ese día debajo.
// Lo usan la reserva, la reprogramación del cliente y la del admin.
interface Props {
  loadDays: (month: string) => Promise<string[]>
  loadSlots: (day: string) => Promise<Slot[]>
  value: Slot | null
  onChange: (s: Slot | null) => void
  current?: string // cita actual (al reprogramar), se resalta en el calendario
  refreshKey?: number // cambiarlo fuerza a recargar (ej. después de un 409)
}

export default function ElegirHorario({ loadDays, loadSlots, value, onChange, current, refreshKey = 0 }: Props) {
  const [month, setMonth] = useState(() => new Date())
  const [days, setDays] = useState<Set<string>>(new Set())
  const [daysState, setDaysState] = useState<'loading' | 'ok' | 'error'>('loading')
  const [day, setDay] = useState<string | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [slotsState, setSlotsState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [error, setError] = useState('')

  const cargarDias = useCallback(async () => {
    setDaysState('loading')
    try {
      const list = await loadDays(mesISO(month))
      setDays(new Set(list)); setDaysState('ok')
      // Primer día libre del mes elegido automáticamente
      setDay((prev) => (prev && list.includes(prev) ? prev : list[0] ?? null))
    } catch (err) { setError(errorMessage(err)); setDaysState('error') }
  }, [loadDays, month])

  const cargarHorarios = useCallback(async (d: string) => {
    setSlotsState('loading')
    try { setSlots(await loadSlots(d)); setSlotsState('ok') }
    catch (err) { setError(errorMessage(err)); setSlotsState('error') }
  }, [loadSlots])

  useEffect(() => { void cargarDias() }, [cargarDias, refreshKey])
  useEffect(() => { if (day) void cargarHorarios(day); else { setSlots([]); setSlotsState('idle') } }, [day, cargarHorarios, refreshKey])

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        {daysState === 'error'
          ? <ErrorBox mensaje={error || 'No pudimos cargar los días disponibles.'} onRetry={() => void cargarDias()} />
          : <Calendario month={month} onMonthChange={(m) => { setMonth(m); onChange(null) }} availableDays={days} loading={daysState === 'loading'}
              selected={day ? diaADate(day) : undefined} highlight={current ? new Date(current) : undefined}
              onSelect={(d) => { if (!d) return; const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; setDay(k); onChange(null) }} />}
        {daysState === 'ok' && days.size === 0 && (
          <p className="font-body text-sm text-muted mt-3">No quedan horarios este mes. Probá con el mes siguiente.</p>
        )}
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <p className="font-display font-medium text-text">{day ? diaLargo(`${day}T12:00:00-03:00`) : 'Elegí un día'}</p>
          <span className="font-mono text-xs text-muted">{TZ_LABEL}</span>
        </div>
        {slotsState === 'loading' && <div className="grid grid-cols-3 gap-2" aria-busy="true">{Array.from({ length: 9 }, (_, i) => <Skeleton key={i} className="h-11" />)}</div>}
        {slotsState === 'error' && <ErrorBox mensaje={error || 'No pudimos cargar los horarios.'} onRetry={() => day && void cargarHorarios(day)} />}
        {slotsState === 'ok' && slots.length === 0 && (
          <p className="font-body text-sm text-muted border border-dashed border-border p-4">No hay horarios ese día, probá otro.</p>
        )}
        {slotsState === 'ok' && slots.length > 0 && (
          <div role="radiogroup" aria-label="Horarios libres" className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-1">
            {slots.map((s) => {
              const sel = value?.startsAt === s.startsAt
              return (
                <button key={s.startsAt} type="button" role="radio" aria-checked={sel} onClick={() => onChange(s)}
                  className={clsx('min-h-11 font-mono text-sm border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-light',
                    sel ? 'bg-accent border-accent text-white' : 'border-border text-text hover:border-accent')}>
                  {hora(s.startsAt)}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export { diaADate }
