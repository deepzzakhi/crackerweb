import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Cargando, ErrorBox, Vacio, EstadoProyecto } from '../../components/booking/ui'
import { getMyProjects, type Project } from '../../services/booking'
import { fecha, diaLargo, hora } from '../../lib/fechas'

export default function MisProyectos() {
  const [proyectos, setProyectos] = useState<Project[]>([])
  const [proxima, setProxima] = useState<{ startsAt: string } | null>(null)
  const [estado, setEstado] = useState<'loading' | 'ok' | 'error'>('loading')

  const cargar = useCallback(async () => {
    setEstado('loading')
    try { const r = await getMyProjects(); setProyectos(r.data); setProxima(r.nextAppointment); setEstado('ok') }
    catch { setEstado('error') }
  }, [])
  useEffect(() => { void cargar() }, [cargar])

  if (estado === 'loading') return <Cargando />
  if (estado === 'error') return <ErrorBox mensaje="No pudimos cargar tus proyectos." onRetry={() => void cargar()} />
  if (!proyectos.length) return <Vacio titulo="Todavía no tenés proyectos" texto="Cuando arranquemos a trabajar juntos, vas a ver acá el avance." accion={<Link to="/agendar" className="btn-secondary min-h-11">Agendar una charla</Link>} />

  return (
    <ul className="grid md:grid-cols-2 gap-4">
      {proyectos.map((p) => (
        <li key={p.id} className="card p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display font-medium text-lg text-text">{p.name}</h2>
            <EstadoProyecto estado={p.status} />
          </div>
          <div>
            <div className="flex justify-between font-mono text-xs text-muted mb-1"><span>Avance</span><span className="text-text">{p.progress}%</span></div>
            <div className="h-2 bg-surface-2 border border-border" role="progressbar" aria-valuenow={p.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Avance de ${p.name}`}>
              <div className="h-full bg-accent" style={{ width: `${p.progress}%` }} />
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3 font-body text-sm">
            <div><dt className="text-muted">Próximo hito</dt><dd className="text-text">{p.nextMilestone || 'A definir'}</dd></div>
            <div><dt className="text-muted">Próxima reunión</dt><dd className="text-text">{proxima ? `${diaLargo(proxima.startsAt)}, ${hora(proxima.startsAt)}` : 'Sin agendar'}</dd></div>
            {p.startDate && <div><dt className="text-muted">Inicio</dt><dd className="text-text">{fecha(p.startDate)}</dd></div>}
            {p.endDate && <div><dt className="text-muted">Entrega estimada</dt><dd className="text-text">{fecha(p.endDate)}</dd></div>}
          </dl>
          {p.stack.length > 0 && (
            <div className="flex flex-wrap gap-1.5">{p.stack.map((s) => <span key={s} className="font-mono text-xs text-muted border border-border px-2 py-0.5">{s}</span>)}</div>
          )}
        </li>
      ))}
    </ul>
  )
}
