import clsx from 'clsx'
import { NavLink } from 'react-router-dom'
import type { AppointmentStatus, InvoiceStatus, ProjectStatus } from '../../services/booking'

// Piezas chicas de interfaz para agenda, portal y admin (con los tokens de Cracker)

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse bg-surface-2 rounded-sm', className)} aria-hidden="true" />
}

export function Cargando({ filas = 3, label = 'Cargando…' }: { filas?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-3">
      {Array.from({ length: filas }, (_, i) => <Skeleton key={i} className="h-16" />)}
    </div>
  )
}

export function Vacio({ titulo, texto, accion }: { titulo: string; texto?: string; accion?: React.ReactNode }) {
  return (
    <div className="border border-dashed border-border p-8 text-center">
      <p className="font-display font-medium text-text">{titulo}</p>
      {texto && <p className="font-body text-sm text-muted mt-1">{texto}</p>}
      {accion && <div className="mt-4 flex justify-center">{accion}</div>}
    </div>
  )
}

export function ErrorBox({ mensaje, onRetry }: { mensaje: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="border border-red-500/40 bg-red-500/5 p-4 flex flex-wrap items-center justify-between gap-3">
      <p className="font-body text-sm text-red-300">{mensaje}</p>
      {onRetry && <button type="button" onClick={onRetry} className="btn-secondary text-xs py-2 px-4 min-h-11">Reintentar</button>}
    </div>
  )
}

export function Aviso({ tipo = 'ok', children }: { tipo?: 'ok' | 'error' | 'info'; children: React.ReactNode }) {
  return (
    <p role={tipo === 'error' ? 'alert' : 'status'} className={clsx('font-body text-sm px-4 py-3 border', {
      'border-emerald-500/40 bg-emerald-500/5 text-emerald-300': tipo === 'ok',
      'border-red-500/40 bg-red-500/5 text-red-300': tipo === 'error',
      'border-accent/40 bg-accent/5 text-accent-light': tipo === 'info',
    })}>{children}</p>
  )
}

const CITA: Record<AppointmentStatus, [string, string]> = {
  PENDING: ['Pendiente', 'border-amber-400/50 text-amber-300 bg-amber-400/5'],
  CONFIRMED: ['Confirmada', 'border-emerald-400/50 text-emerald-300 bg-emerald-400/5'],
  CANCELLED: ['Cancelada', 'border-red-400/50 text-red-300 bg-red-400/5'],
  DONE: ['Realizada', 'border-border text-muted bg-surface-2'],
}
const PROYECTO: Record<ProjectStatus, [string, string]> = {
  PROPOSAL: ['Propuesta', 'border-amber-400/50 text-amber-300 bg-amber-400/5'],
  ACTIVE: ['En curso', 'border-accent/60 text-accent-light bg-accent/10'],
  PAUSED: ['En pausa', 'border-border text-muted bg-surface-2'],
  LIVE: ['En producción', 'border-emerald-400/50 text-emerald-300 bg-emerald-400/5'],
  DONE: ['Terminado', 'border-border text-muted bg-surface-2'],
}
const FACTURA: Record<InvoiceStatus, [string, string]> = {
  DRAFT: ['Borrador', 'border-border text-muted bg-surface-2'],
  SENT: ['Enviada', 'border-accent/60 text-accent-light bg-accent/10'],
  PAID: ['Pagada', 'border-emerald-400/50 text-emerald-300 bg-emerald-400/5'],
  OVERDUE: ['Vencida', 'border-red-400/50 text-red-300 bg-red-400/5'],
}

function Pill([texto, clase]: [string, string]) {
  return <span className={clsx('inline-flex items-center px-2 py-0.5 font-mono text-xs border', clase)}>{texto}</span>
}
export const EstadoCita = ({ estado }: { estado: AppointmentStatus }) => Pill(CITA[estado])
export const EstadoProyecto = ({ estado }: { estado: ProjectStatus }) => Pill(PROYECTO[estado])
export const EstadoFactura = ({ estado }: { estado: InvoiceStatus }) => Pill(FACTURA[estado])
export const ESTADOS_PROYECTO = PROYECTO
export const ESTADOS_FACTURA = FACTURA

/** Pestañas de sección (portal y admin): son links, así que se navegan con teclado */
export function Tabs({ items, label }: { items: { to: string; label: string; end?: boolean }[]; label: string }) {
  return (
    <nav aria-label={label} className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-border">
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} end={it.end}
          className={({ isActive }) => clsx('px-4 min-h-11 inline-flex items-center font-body text-sm whitespace-nowrap border-b-2 -mb-px transition-colors',
            isActive ? 'border-accent text-text' : 'border-transparent text-muted hover:text-text')}>
          {it.label}
        </NavLink>
      ))}
    </nav>
  )
}
