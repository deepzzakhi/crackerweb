import { TZDate } from '@date-fns/tz'
import { addMinutes, addHours, addDays } from 'date-fns'
import { env } from '../config/env'
import { prisma } from '../config/prisma'

// Todo se guarda en UTC; los horarios de atención se definen en hora de Argentina.

export const ACTIVE_STATUSES = ['PENDING', 'CONFIRMED'] as const

/** "2026-11-05" → { y, m (0-11), d } validado */
export function parseDay(day: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day)
  if (!m) return null
  const y = Number(m[1]), mo = Number(m[2]) - 1, d = Number(m[3])
  const probe = new TZDate(y, mo, d, 12, 0, env.BUSINESS_TZ)
  if (probe.getFullYear() !== y || probe.getMonth() !== mo || probe.getDate() !== d) return null
  return { y, m: mo, d }
}

/** Día local (YYYY-MM-DD en hora de Argentina) de un instante UTC */
export function localDay(date: Date) {
  const t = new TZDate(date.getTime(), env.BUSINESS_TZ)
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}

export async function getHostId() {
  const email = env.ADMIN_EMAILS[0]
  if (!email) throw new Error('Falta ADMIN_EMAILS: no hay anfitrión para las citas')
  // El anfitrión es el primer admin; se crea si todavía no inició sesión
  const host = await prisma.user.upsert({ where: { email }, update: {}, create: { email, name: 'Cracker', role: 'ADMIN' } })
  return host.id
}

export interface Slot { startsAt: string; endsAt: string }

/**
 * Horarios realmente libres de un día para un tipo de reunión.
 * Respeta: franjas semanales, anticipación mínima, horizonte, días bloqueados,
 * citas activas del anfitrión y el descanso entre citas. `ignoreAppointmentId`
 * sirve para reprogramar (la cita que se mueve no se bloquea a sí misma).
 */
export async function freeSlots(opts: { day: string; durationMin: number; hostId: string; ignoreAppointmentId?: string; now?: Date; adminOverride?: boolean }): Promise<Slot[]> {
  const parsed = parseDay(opts.day)
  if (!parsed) return []
  const now = opts.now ?? new Date()
  // El admin puede mover citas sin anticipación mínima ni horizonte (pero nunca al pasado)
  const earliest = opts.adminOverride ? now : addHours(now, env.BOOKING_MIN_NOTICE_HOURS)
  const latest = opts.adminOverride ? addDays(now, 365) : addDays(now, env.BOOKING_HORIZON_DAYS)

  const dayStart = new TZDate(parsed.y, parsed.m, parsed.d, 0, 0, env.BUSINESS_TZ)
  const dayEnd = addDays(dayStart, 1)
  if (dayEnd <= earliest || dayStart > latest) return []

  const weekday = dayStart.getDay()
  const rules = await prisma.availabilityRule.findMany({ where: { weekday }, orderBy: { startMin: 'asc' } })
  if (!rules.length) return []

  const [blocks, busy] = await Promise.all([
    prisma.availabilityException.findMany({ where: { startsAt: { lt: dayEnd }, endsAt: { gt: dayStart } } }),
    prisma.appointment.findMany({
      where: {
        hostId: opts.hostId,
        status: { in: [...ACTIVE_STATUSES] },
        startsAt: { lt: addHours(dayEnd, 2) },
        endsAt: { gt: addHours(dayStart, -2) },
        ...(opts.ignoreAppointmentId ? { id: { not: opts.ignoreAppointmentId } } : {}),
      },
      select: { startsAt: true, endsAt: true },
    }),
  ])

  const slots: Slot[] = []
  const seen = new Set<number>()
  for (const r of rules) {
    for (let t = r.startMin; t + opts.durationMin <= r.endMin; t += r.slotMin) {
      const start = new TZDate(parsed.y, parsed.m, parsed.d, Math.floor(t / 60), t % 60, env.BUSINESS_TZ)
      const end = addMinutes(start, opts.durationMin)
      if (start < earliest || start > latest || seen.has(start.getTime())) continue
      const blocked = blocks.some((b) => b.startsAt < end && b.endsAt > start)
      // El descanso se aplica alrededor de cada cita existente
      const taken = busy.some((a) => addMinutes(a.startsAt, -r.bufferMin) < end && addMinutes(a.endsAt, r.bufferMin) > start)
      if (blocked || taken) continue
      seen.add(start.getTime())
      slots.push({ startsAt: new Date(start.getTime()).toISOString(), endsAt: new Date(end.getTime()).toISOString() })
    }
  }
  return slots.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}

/** Días con al menos un horario libre en un mes (para atenuar el resto en el calendario) */
export async function availableDays(opts: { month: string; durationMin: number; hostId: string; ignoreAppointmentId?: string; adminOverride?: boolean }) {
  const m = /^(\d{4})-(\d{2})$/.exec(opts.month)
  if (!m) return []
  const y = Number(m[1]), mo = Number(m[2]) - 1
  const days: string[] = []
  const last = new TZDate(y, mo + 1, 0, 12, 0, env.BUSINESS_TZ).getDate()
  for (let d = 1; d <= last; d++) {
    const day = `${y}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    if ((await freeSlots({ ...opts, day })).length) days.push(day)
  }
  return days
}

/** Error de la restricción de exclusión de Postgres (dos citas superpuestas) */
export function isOverlapError(err: unknown) {
  const msg = String((err as { message?: string })?.message ?? '')
  return msg.includes('Appointment_no_overlap') || msg.includes('23P01')
}
