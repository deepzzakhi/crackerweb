import { Request, Response } from 'express'
import { z } from 'zod'
import { addMinutes, addHours } from 'date-fns'
import { env } from '../config/env'
import { prisma } from '../config/prisma'
import type { AuthRequest } from '../middlewares/auth'
import { freeSlots, availableDays, getHostId, localDay, isOverlapError, ACTIVE_STATUSES } from '../services/availability'
import { sendMail, buildIcs, fmtLocal } from '../services/mail'

const isActive = (s: string) => (ACTIVE_STATUSES as readonly string[]).includes(s)

// ─── Público ───────────────────────────────────────────────────────────────

export async function listMeetingTypes(_req: Request, res: Response) {
  const types = await prisma.meetingType.findMany({
    where: { active: true }, orderBy: [{ sortOrder: 'asc' }, { durationMin: 'asc' }],
    select: { id: true, slug: true, name: true, description: true, durationMin: true, priceCents: true, currency: true },
  })
  res.json({ success: true, data: types, timezone: env.BUSINESS_TZ })
}

const slotsQuery = z.object({
  type: z.string().min(1).max(60),
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  ignore: z.string().max(40).optional(), // al reprogramar, la cita actual no se cuenta como ocupada
})

export async function getSlots(req: AuthRequest, res: Response) {
  const q = slotsQuery.safeParse(req.query)
  if (!q.success || (!q.data.day && !q.data.month)) { res.status(400).json({ success: false, message: 'Consulta inválida' }); return }
  const type = await prisma.meetingType.findFirst({ where: { OR: [{ id: q.data.type }, { slug: q.data.type }], active: true } })
  if (!type) { res.status(404).json({ success: false, message: 'Ese tipo de reunión no existe' }); return }
  const hostId = await getHostId()
  // Solo se ignora una cita propia: nadie puede "liberar" horarios ajenos
  let ignore: string | undefined
  if (q.data.ignore && req.userId && !req.isDemo) {
    const own = await prisma.appointment.findFirst({ where: { id: q.data.ignore, userId: req.userId }, select: { id: true } })
    ignore = own?.id
  }
  if (q.data.month) {
    res.json({ success: true, data: { days: await availableDays({ month: q.data.month, durationMin: type.durationMin, hostId, ignoreAppointmentId: ignore }) } })
    return
  }
  res.json({ success: true, data: { slots: await freeSlots({ day: q.data.day!, durationMin: type.durationMin, hostId, ignoreAppointmentId: ignore }) } })
}

// ─── Cliente ───────────────────────────────────────────────────────────────

const PUBLIC_FIELDS = {
  id: true, startsAt: true, endsAt: true, status: true, modality: true, topic: true, company: true, phone: true, createdAt: true,
  meetingType: { select: { id: true, name: true, durationMin: true, slug: true } },
} as const

/** "Realizada" se muestra para las confirmadas que ya terminaron */
export const withDisplayStatus = <T extends { status: string; endsAt: Date }>(a: T) =>
  ({ ...a, displayStatus: a.status === 'CONFIRMED' && a.endsAt < new Date() ? 'DONE' : a.status })

const bookSchema = z.object({
  meetingTypeId: z.string().min(1).max(40),
  startsAt: z.string().datetime(),
  modality: z.enum(['VIRTUAL', 'PRESENCIAL']),
  topic: z.string().trim().min(3).max(500),
  company: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).optional(),
})

export async function createAppointment(req: AuthRequest, res: Response) {
  const parsed = bookSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ success: false, message: 'Revisá los datos de la reserva' }); return }
  const data = parsed.data
  const userId = req.userId!
  const startsAt = new Date(data.startsAt)

  const type = await prisma.meetingType.findFirst({ where: { id: data.meetingTypeId, active: true } })
  if (!type) { res.status(404).json({ success: false, message: 'Ese tipo de reunión no existe' }); return }
  const hostId = await getHostId()

  // Idempotencia: si el mismo cliente ya reservó ese horario (doble click, reintento), se devuelve la misma cita
  const same = await prisma.appointment.findFirst({ where: { userId, startsAt, status: { in: [...ACTIVE_STATUSES] } }, select: PUBLIC_FIELDS })
  if (same) { res.status(200).json({ success: true, data: withDisplayStatus(same) }); return }

  const active = await prisma.appointment.count({ where: { userId, status: { in: [...ACTIVE_STATUSES] }, startsAt: { gt: new Date() } } })
  if (active >= env.BOOKING_MAX_ACTIVE_PER_USER) {
    res.status(429).json({ success: false, message: `Ya tenés ${active} citas próximas. Cancelá alguna o esperá a que pasen.` }); return
  }

  // El horario tiene que estar entre los libres (franjas, anticipación, bloqueos, descanso)
  const day = localDay(startsAt)
  const slots = await freeSlots({ day, durationMin: type.durationMin, hostId })
  if (!slots.some((s) => s.startsAt === startsAt.toISOString())) {
    res.status(409).json({ success: false, message: 'Ese horario ya no está disponible. Elegí otro.', data: { slots } }); return
  }

  try {
    const appt = await prisma.$transaction((tx) => tx.appointment.create({
      data: {
        userId, hostId, meetingTypeId: type.id, startsAt, endsAt: addMinutes(startsAt, type.durationMin),
        modality: data.modality, topic: data.topic, company: data.company || null, phone: data.phone || null,
      },
      select: { ...PUBLIC_FIELDS, user: { select: { name: true, email: true } } },
    }))
    const { user, ...pub } = appt
    void sendMail({
      to: env.ADMIN_EMAILS,
      subject: `Nueva cita pendiente: ${type.name} · ${fmtLocal(startsAt)}`,
      text: `${user.name} (${user.email}) reservó "${type.name}" para el ${fmtLocal(startsAt)}.\nModalidad: ${data.modality === 'VIRTUAL' ? 'virtual' : 'presencial'}\nTema: ${data.topic}\n\nConfirmala desde el panel admin.`,
    })
    res.status(201).json({ success: true, data: withDisplayStatus(pub) })
  } catch (err) {
    if (isOverlapError(err)) {
      // Otra persona tomó el horario un instante antes: se devuelven los horarios actualizados
      res.status(409).json({ success: false, message: 'Alguien reservó ese horario recién. Elegí otro.', data: { slots: await freeSlots({ day, durationMin: type.durationMin, hostId }) } })
      return
    }
    throw err
  }
}

export async function myAppointments(req: AuthRequest, res: Response) {
  const list = await prisma.appointment.findMany({ where: { userId: req.userId! }, orderBy: { startsAt: 'desc' }, select: PUBLIC_FIELDS, take: 100 })
  res.json({ success: true, data: list.map(withDisplayStatus), changeLimitHours: env.BOOKING_CHANGE_LIMIT_HOURS })
}

/** Busca una cita del cliente; si no es suya responde 404 (no revela que existe) */
async function ownAppointment(req: AuthRequest, res: Response) {
  const appt = await prisma.appointment.findFirst({ where: { id: String(req.params.id), userId: req.userId! }, include: { meetingType: true } })
  if (!appt) res.status(404).json({ success: false, message: 'No encontramos esa cita' })
  return appt
}

const canChange = (startsAt: Date) => startsAt > addHours(new Date(), env.BOOKING_CHANGE_LIMIT_HOURS)

export async function cancelAppointment(req: AuthRequest, res: Response) {
  const appt = await ownAppointment(req, res); if (!appt) return
  if (!isActive(appt.status)) { res.status(409).json({ success: false, message: 'Esta cita ya no se puede cancelar' }); return }
  if (!canChange(appt.startsAt)) { res.status(409).json({ success: false, message: `Solo podés cancelar hasta ${env.BOOKING_CHANGE_LIMIT_HOURS} h antes. Escribinos por WhatsApp.` }); return }
  const upd = await prisma.appointment.update({ where: { id: appt.id }, data: { status: 'CANCELLED', cancelledAt: new Date() }, select: PUBLIC_FIELDS })
  void sendMail({ to: env.ADMIN_EMAILS, subject: `Cita cancelada por el cliente · ${fmtLocal(appt.startsAt)}`, text: `Se canceló "${appt.meetingType.name}" del ${fmtLocal(appt.startsAt)}.` })
  res.json({ success: true, data: withDisplayStatus(upd) })
}

const rescheduleSchema = z.object({ startsAt: z.string().datetime() })

export async function rescheduleAppointment(req: AuthRequest, res: Response) {
  const parsed = rescheduleSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ success: false, message: 'Elegí un horario válido' }); return }
  const appt = await ownAppointment(req, res); if (!appt) return
  if (!isActive(appt.status)) { res.status(409).json({ success: false, message: 'Esta cita ya no se puede reprogramar' }); return }
  if (!canChange(appt.startsAt)) { res.status(409).json({ success: false, message: `Solo podés reprogramar hasta ${env.BOOKING_CHANGE_LIMIT_HOURS} h antes. Escribinos por WhatsApp.` }); return }
  const startsAt = new Date(parsed.data.startsAt)
  const day = localDay(startsAt)
  const slots = await freeSlots({ day, durationMin: appt.meetingType.durationMin, hostId: appt.hostId, ignoreAppointmentId: appt.id })
  if (!slots.some((s) => s.startsAt === startsAt.toISOString())) { res.status(409).json({ success: false, message: 'Ese horario ya no está disponible. Elegí otro.', data: { slots } }); return }
  try {
    // Al moverla vuelve a pendiente: el admin la confirma de nuevo
    const upd = await prisma.appointment.update({ where: { id: appt.id }, data: { startsAt, endsAt: addMinutes(startsAt, appt.meetingType.durationMin), status: 'PENDING' }, select: PUBLIC_FIELDS })
    void sendMail({ to: env.ADMIN_EMAILS, subject: `Cita reprogramada · ${fmtLocal(startsAt)}`, text: `"${appt.meetingType.name}" pasó del ${fmtLocal(appt.startsAt)} al ${fmtLocal(startsAt)}. Queda pendiente de confirmar.` })
    res.json({ success: true, data: withDisplayStatus(upd) })
  } catch (err) {
    if (isOverlapError(err)) { res.status(409).json({ success: false, message: 'Alguien reservó ese horario recién. Elegí otro.', data: { slots } }); return }
    throw err
  }
}

export async function appointmentIcs(req: AuthRequest, res: Response) {
  const appt = await ownAppointment(req, res); if (!appt) return
  const ics = buildIcs({
    id: appt.id, startsAt: appt.startsAt, endsAt: appt.endsAt, cancelled: appt.status === 'CANCELLED',
    title: `${appt.meetingType.name} con Cracker`,
    description: `Modalidad: ${appt.modality === 'VIRTUAL' ? 'virtual' : 'presencial'}. Tema: ${appt.topic}`,
  })
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="cita-cracker.ics"')
  res.send(ics)
}

// ─── Portal: proyectos y finanzas (solo lectura) ───────────────────────────

export async function myProjects(req: AuthRequest, res: Response) {
  const [projects, next] = await Promise.all([
    prisma.project.findMany({ where: { userId: req.userId! }, orderBy: { updatedAt: 'desc' } }),
    prisma.appointment.findFirst({ where: { userId: req.userId!, status: { in: [...ACTIVE_STATUSES] }, startsAt: { gt: new Date() } }, orderBy: { startsAt: 'asc' }, select: { id: true, startsAt: true, status: true } }),
  ])
  res.json({ success: true, data: projects.map(({ userId: _u, ...p }) => p), nextAppointment: next })
}

/** "Vencida" se calcula: enviada y con vencimiento pasado */
export const invoiceDisplay = <T extends { status: string; dueDate: Date | null }>(i: T) =>
  ({ ...i, status: i.status === 'SENT' && i.dueDate && i.dueDate < new Date() ? 'OVERDUE' : i.status })

export async function myInvoices(req: AuthRequest, res: Response) {
  // Los borradores no se muestran al cliente
  const list = await prisma.invoice.findMany({ where: { userId: req.userId!, status: { not: 'DRAFT' } }, orderBy: [{ dueDate: 'desc' }, { createdAt: 'desc' }] })
  res.json({ success: true, data: list.map(({ userId: _u, ...i }) => invoiceDisplay(i)) })
}
