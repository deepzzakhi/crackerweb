import { Response } from 'express'
import { z } from 'zod'
import { addMinutes } from 'date-fns'
import { env } from '../config/env'
import { prisma } from '../config/prisma'
import type { AuthRequest } from '../middlewares/auth'
import { freeSlots, availableDays, localDay, isOverlapError } from '../services/availability'
import { sendMail, fmtLocal } from '../services/mail'
import { withDisplayStatus, invoiceDisplay } from './bookingController'

const bad = (res: Response, message = 'Revisá los datos') => res.status(400).json({ success: false, message })
const notFound = (res: Response) => res.status(404).json({ success: false, message: 'No encontrado' })
const id = (req: AuthRequest) => String(req.params.id)

// ─── Disponibilidad semanal ────────────────────────────────────────────────

export async function getAvailability(_req: AuthRequest, res: Response) {
  const rules = await prisma.availabilityRule.findMany({ orderBy: [{ weekday: 'asc' }, { startMin: 'asc' }] })
  res.json({ success: true, data: rules, timezone: env.BUSINESS_TZ })
}

const ruleSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startMin: z.number().int().min(0).max(1439),
  endMin: z.number().int().min(1).max(1440),
  slotMin: z.number().int().min(5).max(240),
  bufferMin: z.number().int().min(0).max(120),
}).refine((r) => r.endMin > r.startMin, { message: 'La hora de fin tiene que ser posterior al inicio' })

// Se reemplaza toda la grilla semanal de una vez (más simple y sin estados intermedios)
export async function putAvailability(req: AuthRequest, res: Response) {
  const parsed = z.object({ rules: z.array(ruleSchema).max(50) }).safeParse(req.body)
  if (!parsed.success) return bad(res, parsed.error.issues[0]?.message)
  const rules = await prisma.$transaction(async (tx) => {
    await tx.availabilityRule.deleteMany({})
    await tx.availabilityRule.createMany({ data: parsed.data.rules.map((r) => ({ ...r, timezone: env.BUSINESS_TZ })) })
    return tx.availabilityRule.findMany({ orderBy: [{ weekday: 'asc' }, { startMin: 'asc' }] })
  })
  res.json({ success: true, data: rules })
}

// ─── Bloqueos ──────────────────────────────────────────────────────────────

export async function listExceptions(_req: AuthRequest, res: Response) {
  const list = await prisma.availabilityException.findMany({ where: { endsAt: { gt: new Date() } }, orderBy: { startsAt: 'asc' } })
  res.json({ success: true, data: list })
}

export async function createException(req: AuthRequest, res: Response) {
  const parsed = z.object({ startsAt: z.string().datetime(), endsAt: z.string().datetime(), reason: z.string().trim().max(200).default('') }).safeParse(req.body)
  if (!parsed.success) return bad(res)
  const startsAt = new Date(parsed.data.startsAt), endsAt = new Date(parsed.data.endsAt)
  if (endsAt <= startsAt) return bad(res, 'La fecha de fin tiene que ser posterior al inicio')
  const exc = await prisma.availabilityException.create({ data: { startsAt, endsAt, reason: parsed.data.reason } })
  // Avisa si quedaron citas activas dentro del bloqueo (no las cancela sola)
  const affected = await prisma.appointment.count({ where: { status: { in: ['PENDING', 'CONFIRMED'] }, startsAt: { lt: endsAt }, endsAt: { gt: startsAt } } })
  res.status(201).json({ success: true, data: exc, affectedAppointments: affected })
}

export async function deleteException(req: AuthRequest, res: Response) {
  const r = await prisma.availabilityException.deleteMany({ where: { id: id(req) } })
  if (!r.count) return notFound(res)
  res.json({ success: true })
}

// ─── Tipos de reunión ──────────────────────────────────────────────────────

const typeSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().regex(/^[a-z0-9-]{2,40}$/, 'El identificador solo admite minúsculas, números y guiones'),
  description: z.string().trim().max(300).default(''),
  durationMin: z.number().int().min(10).max(240),
  priceCents: z.number().int().min(0).nullable().optional(),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(100).default(0),
})

export async function listTypes(_req: AuthRequest, res: Response) {
  res.json({ success: true, data: await prisma.meetingType.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }) })
}

export async function createType(req: AuthRequest, res: Response) {
  const parsed = typeSchema.safeParse(req.body)
  if (!parsed.success) return bad(res, parsed.error.issues[0]?.message)
  try { res.status(201).json({ success: true, data: await prisma.meetingType.create({ data: parsed.data }) }) }
  catch { res.status(409).json({ success: false, message: 'Ya existe un tipo con ese identificador' }) }
}

export async function updateType(req: AuthRequest, res: Response) {
  const parsed = typeSchema.partial().safeParse(req.body)
  if (!parsed.success) return bad(res, parsed.error.issues[0]?.message)
  const exists = await prisma.meetingType.findUnique({ where: { id: id(req) } })
  if (!exists) return notFound(res)
  res.json({ success: true, data: await prisma.meetingType.update({ where: { id: exists.id }, data: parsed.data }) })
}

// ─── Citas ─────────────────────────────────────────────────────────────────

const listQuery = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'DONE', 'ALL']).default('ALL'),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})

export async function listAppointments(req: AuthRequest, res: Response) {
  const q = listQuery.safeParse(req.query)
  if (!q.success) return bad(res, 'Filtro inválido')
  const { status, from, to } = q.data
  const list = await prisma.appointment.findMany({
    where: {
      ...(status !== 'ALL' ? { status } : {}),
      ...(from || to ? { startsAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lt: new Date(to) } : {}) } } : {}),
    },
    orderBy: { startsAt: 'asc' },
    take: 300,
    include: { meetingType: { select: { name: true, durationMin: true } }, user: { select: { id: true, name: true, email: true } } },
  })
  res.json({ success: true, data: list.map(withDisplayStatus) })
}

async function findAppt(req: AuthRequest, res: Response) {
  const a = await prisma.appointment.findUnique({ where: { id: id(req) }, include: { meetingType: true, user: { select: { name: true, email: true } } } })
  if (!a) notFound(res)
  return a
}

export async function confirmAppointment(req: AuthRequest, res: Response) {
  const a = await findAppt(req, res); if (!a) return
  if (a.status !== 'PENDING') { res.status(409).json({ success: false, message: 'Solo se confirman citas pendientes' }); return }
  const upd = await prisma.appointment.update({ where: { id: a.id }, data: { status: 'CONFIRMED' } })
  void sendMail({ to: a.user.email, subject: `Tu cita con Cracker está confirmada · ${fmtLocal(a.startsAt)}`, text: `Hola ${a.user.name}, confirmamos "${a.meetingType.name}" para el ${fmtLocal(a.startsAt)}. Podés verla en Mis citas.` })
  res.json({ success: true, data: withDisplayStatus(upd) })
}

export async function adminCancelAppointment(req: AuthRequest, res: Response) {
  const a = await findAppt(req, res); if (!a) return
  if (a.status === 'CANCELLED') { res.status(409).json({ success: false, message: 'La cita ya estaba cancelada' }); return }
  const upd = await prisma.appointment.update({ where: { id: a.id }, data: { status: 'CANCELLED', cancelledAt: new Date() } })
  void sendMail({ to: a.user.email, subject: `Tu cita con Cracker fue cancelada · ${fmtLocal(a.startsAt)}`, text: `Hola ${a.user.name}, tuvimos que cancelar "${a.meetingType.name}" del ${fmtLocal(a.startsAt)}. Podés elegir otro horario desde la web.` })
  res.json({ success: true, data: withDisplayStatus(upd) })
}

export async function markDone(req: AuthRequest, res: Response) {
  const a = await findAppt(req, res); if (!a) return
  if (a.status !== 'CONFIRMED') { res.status(409).json({ success: false, message: 'Solo se marcan como realizadas las citas confirmadas' }); return }
  res.json({ success: true, data: withDisplayStatus(await prisma.appointment.update({ where: { id: a.id }, data: { status: 'DONE' } })) })
}

export async function adminReschedule(req: AuthRequest, res: Response) {
  const parsed = z.object({ startsAt: z.string().datetime() }).safeParse(req.body)
  if (!parsed.success) return bad(res, 'Elegí un horario válido')
  const a = await findAppt(req, res); if (!a) return
  const startsAt = new Date(parsed.data.startsAt)
  const slots = await freeSlots({ day: localDay(startsAt), durationMin: a.meetingType.durationMin, hostId: a.hostId, ignoreAppointmentId: a.id, adminOverride: true })
  if (!slots.some((s) => s.startsAt === startsAt.toISOString())) { res.status(409).json({ success: false, message: 'Ese horario no está libre', data: { slots } }); return }
  try {
    // Reprogramada por el admin queda confirmada
    const upd = await prisma.appointment.update({ where: { id: a.id }, data: { startsAt, endsAt: addMinutes(startsAt, a.meetingType.durationMin), status: 'CONFIRMED' } })
    void sendMail({ to: a.user.email, subject: `Movimos tu cita con Cracker · ${fmtLocal(startsAt)}`, text: `Hola ${a.user.name}, "${a.meetingType.name}" pasó al ${fmtLocal(startsAt)}.` })
    res.json({ success: true, data: withDisplayStatus(upd) })
  } catch (err) {
    if (isOverlapError(err)) { res.status(409).json({ success: false, message: 'Ese horario se ocupó recién', data: { slots } }); return }
    throw err
  }
}

// Horarios libres para mover una cita (sin anticipación mínima ni horizonte)
export async function adminSlots(req: AuthRequest, res: Response) {
  const q = z.object({ day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), month: z.string().regex(/^\d{4}-\d{2}$/).optional() }).safeParse(req.query)
  if (!q.success || (!q.data.day && !q.data.month)) return bad(res, 'Consulta inválida')
  const a = await findAppt(req, res); if (!a) return
  const base = { durationMin: a.meetingType.durationMin, hostId: a.hostId, ignoreAppointmentId: a.id, adminOverride: true }
  if (q.data.month) { res.json({ success: true, data: { days: await availableDays({ ...base, month: q.data.month }) } }); return }
  res.json({ success: true, data: { slots: await freeSlots({ ...base, day: q.data.day! }) } })
}

export async function updateNotes(req: AuthRequest, res: Response) {
  const parsed = z.object({ adminNotes: z.string().max(2000) }).safeParse(req.body)
  if (!parsed.success) return bad(res)
  const r = await prisma.appointment.updateMany({ where: { id: id(req) }, data: { adminNotes: parsed.data.adminNotes } })
  if (!r.count) return notFound(res)
  res.json({ success: true })
}

// ─── Clientes, proyectos y facturas (los carga el admin) ───────────────────

export async function listClients(_req: AuthRequest, res: Response) {
  const users = await prisma.user.findMany({
    where: { email: { notIn: env.ADMIN_EMAILS } }, orderBy: { name: 'asc' }, take: 500,
    select: { id: true, name: true, email: true, _count: { select: { appointments: true, projects: true, invoices: true } } },
  })
  res.json({ success: true, data: users })
}

const projectSchema = z.object({
  userId: z.string().min(1).max(40),
  name: z.string().trim().min(2).max(120),
  status: z.enum(['PROPOSAL', 'ACTIVE', 'PAUSED', 'LIVE', 'DONE']),
  progress: z.number().int().min(0).max(100),
  stack: z.array(z.string().trim().min(1).max(40)).max(15).default([]),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  nextMilestone: z.string().trim().max(200).default(''),
})
const toDates = <T extends { startDate?: string | null; endDate?: string | null }>(d: T) => ({
  ...d,
  ...(d.startDate !== undefined ? { startDate: d.startDate ? new Date(d.startDate) : null } : {}),
  ...(d.endDate !== undefined ? { endDate: d.endDate ? new Date(d.endDate) : null } : {}),
})

export async function listProjects(_req: AuthRequest, res: Response) {
  res.json({ success: true, data: await prisma.project.findMany({ orderBy: { updatedAt: 'desc' }, include: { user: { select: { name: true, email: true } } } }) })
}
export async function createProject(req: AuthRequest, res: Response) {
  const parsed = projectSchema.safeParse(req.body)
  if (!parsed.success) return bad(res, parsed.error.issues[0]?.message)
  if (!(await prisma.user.findUnique({ where: { id: parsed.data.userId } }))) return bad(res, 'Ese cliente no existe')
  res.status(201).json({ success: true, data: await prisma.project.create({ data: toDates(parsed.data) }) })
}
export async function updateProject(req: AuthRequest, res: Response) {
  const parsed = projectSchema.partial().safeParse(req.body)
  if (!parsed.success) return bad(res, parsed.error.issues[0]?.message)
  if (!(await prisma.project.findUnique({ where: { id: id(req) } }))) return notFound(res)
  res.json({ success: true, data: await prisma.project.update({ where: { id: id(req) }, data: toDates(parsed.data) }) })
}
export async function deleteProject(req: AuthRequest, res: Response) {
  const r = await prisma.project.deleteMany({ where: { id: id(req) } })
  if (!r.count) return notFound(res)
  res.json({ success: true })
}

const invoiceSchema = z.object({
  userId: z.string().min(1).max(40),
  kind: z.enum(['QUOTE', 'INVOICE']),
  number: z.string().trim().min(1).max(30),
  concept: z.string().trim().min(2).max(200),
  amountCents: z.number().int().min(0).max(1e13),
  currency: z.enum(['ARS', 'USD']).default('ARS'),
  status: z.enum(['DRAFT', 'SENT', 'PAID']),
  dueDate: z.string().datetime().nullable().optional(),
  pdfUrl: z.string().url().max(500).refine((u) => u.startsWith('https://'), 'El link tiene que empezar con https://').nullable().optional(),
})
const invoiceData = <T extends { dueDate?: string | null; status?: string }>(d: T) => ({
  ...d,
  ...(d.dueDate !== undefined ? { dueDate: d.dueDate ? new Date(d.dueDate) : null } : {}),
  ...(d.status ? { paidAt: d.status === 'PAID' ? new Date() : null } : {}),
})

export async function listInvoices(_req: AuthRequest, res: Response) {
  const list = await prisma.invoice.findMany({ orderBy: [{ createdAt: 'desc' }], include: { user: { select: { name: true, email: true } } } })
  res.json({ success: true, data: list.map(invoiceDisplay) })
}
export async function createInvoice(req: AuthRequest, res: Response) {
  const parsed = invoiceSchema.safeParse(req.body)
  if (!parsed.success) return bad(res, parsed.error.issues[0]?.message)
  if (!(await prisma.user.findUnique({ where: { id: parsed.data.userId } }))) return bad(res, 'Ese cliente no existe')
  try { res.status(201).json({ success: true, data: await prisma.invoice.create({ data: invoiceData(parsed.data) }) }) }
  catch { res.status(409).json({ success: false, message: 'Ya existe un comprobante con ese número' }) }
}
export async function updateInvoice(req: AuthRequest, res: Response) {
  const parsed = invoiceSchema.partial().safeParse(req.body)
  if (!parsed.success) return bad(res, parsed.error.issues[0]?.message)
  if (!(await prisma.invoice.findUnique({ where: { id: id(req) } }))) return notFound(res)
  try { res.json({ success: true, data: await prisma.invoice.update({ where: { id: id(req) }, data: invoiceData(parsed.data) }) }) }
  catch { res.status(409).json({ success: false, message: 'Ya existe un comprobante con ese número' }) }
}
export async function deleteInvoice(req: AuthRequest, res: Response) {
  const r = await prisma.invoice.deleteMany({ where: { id: id(req) } })
  if (!r.count) return notFound(res)
  res.json({ success: true })
}
