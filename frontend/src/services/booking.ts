import api from './api'

// ─── Tipos que devuelve la API de agenda y portal ──────────────────────────

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'DONE'
export type Modality = 'VIRTUAL' | 'PRESENCIAL'

export interface MeetingType {
  id: string; slug: string; name: string; description: string; durationMin: number
  priceCents: number | null; currency: string; active?: boolean; sortOrder?: number
}
export interface Slot { startsAt: string; endsAt: string }
export interface Appointment {
  id: string; startsAt: string; endsAt: string; status: AppointmentStatus; displayStatus: AppointmentStatus
  modality: Modality; topic: string; company: string | null; phone: string | null; createdAt: string
  meetingType: { id: string; name: string; durationMin: number; slug?: string }
}
export interface AdminAppointment extends Appointment {
  adminNotes: string
  user: { id: string; name: string; email: string }
}
export type ProjectStatus = 'PROPOSAL' | 'ACTIVE' | 'PAUSED' | 'LIVE' | 'DONE'
export interface Project {
  id: string; name: string; status: ProjectStatus; progress: number; stack: string[]
  startDate: string | null; endDate: string | null; nextMilestone: string; updatedAt: string
  userId?: string; user?: { name: string; email: string }
}
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'
export interface Invoice {
  id: string; kind: 'QUOTE' | 'INVOICE'; number: string; concept: string; amountCents: number; currency: string
  status: InvoiceStatus; dueDate: string | null; paidAt: string | null; pdfUrl: string | null
  userId?: string; user?: { name: string; email: string }
}
export interface AvailabilityRule { id?: string; weekday: number; startMin: number; endMin: number; slotMin: number; bufferMin: number }
export interface AvailabilityException { id: string; startsAt: string; endsAt: string; reason: string }
export interface Client { id: string; name: string; email: string; _count: { appointments: number; projects: number; invoices: number } }

/** Mensaje legible de un error de la API */
export const errorMessage = (err: unknown, fallback = 'Algo salió mal. Probá de nuevo.') =>
  (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? fallback
export const errorStatus = (err: unknown) => (err as { response?: { status?: number } }).response?.status

// ─── Público ───────────────────────────────────────────────────────────────
export const getMeetingTypes = async () => (await api.get<{ data: MeetingType[] }>('/booking/types')).data.data
export const getAvailableDays = async (type: string, month: string, ignore?: string) =>
  (await api.get<{ data: { days: string[] } }>('/booking/slots', { params: { type, month, ignore } })).data.data.days
export const getSlots = async (type: string, day: string, ignore?: string) =>
  (await api.get<{ data: { slots: Slot[] } }>('/booking/slots', { params: { type, day, ignore } })).data.data.slots

// ─── Cliente ───────────────────────────────────────────────────────────────
export const bookAppointment = async (body: { meetingTypeId: string; startsAt: string; modality: Modality; topic: string; company?: string; phone?: string }) =>
  (await api.post<{ data: Appointment }>('/me/appointments', body)).data.data
export const getMyAppointments = async () =>
  (await api.get<{ data: Appointment[]; changeLimitHours: number }>('/me/appointments')).data
export const cancelMyAppointment = async (id: string) => (await api.post<{ data: Appointment }>(`/me/appointments/${id}/cancel`)).data.data
export const rescheduleMyAppointment = async (id: string, startsAt: string) =>
  (await api.post<{ data: Appointment }>(`/me/appointments/${id}/reschedule`, { startsAt })).data.data
export const getMyProjects = async () =>
  (await api.get<{ data: Project[]; nextAppointment: { id: string; startsAt: string; status: AppointmentStatus } | null }>('/me/projects')).data
export const getMyInvoices = async () => (await api.get<{ data: Invoice[] }>('/me/invoices')).data.data

/** Descarga el .ics con la sesión (un link directo no lleva el token) */
export async function downloadIcs(id: string) {
  const r = await api.get(`/me/appointments/${id}/ics`, { responseType: 'blob' })
  const url = URL.createObjectURL(r.data as Blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'cita-cracker.ics'
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ─── Admin ─────────────────────────────────────────────────────────────────
export const admin = {
  appointments: async (params: { status?: string; from?: string; to?: string }) =>
    (await api.get<{ data: AdminAppointment[] }>('/admin/appointments', { params })).data.data,
  confirm: async (id: string) => (await api.post(`/admin/appointments/${id}/confirm`)).data,
  cancel: async (id: string) => (await api.post(`/admin/appointments/${id}/cancel`)).data,
  done: async (id: string) => (await api.post(`/admin/appointments/${id}/done`)).data,
  reschedule: async (id: string, startsAt: string) => (await api.post(`/admin/appointments/${id}/reschedule`, { startsAt })).data,
  notes: async (id: string, adminNotes: string) => (await api.patch(`/admin/appointments/${id}/notes`, { adminNotes })).data,
  slotsDays: async (id: string, month: string) => (await api.get<{ data: { days: string[] } }>(`/admin/appointments/${id}/slots`, { params: { month } })).data.data.days,
  slots: async (id: string, day: string) => (await api.get<{ data: { slots: Slot[] } }>(`/admin/appointments/${id}/slots`, { params: { day } })).data.data.slots,
  availability: async () => (await api.get<{ data: AvailabilityRule[] }>('/admin/availability')).data.data,
  saveAvailability: async (rules: AvailabilityRule[]) => (await api.put<{ data: AvailabilityRule[] }>('/admin/availability', { rules })).data.data,
  exceptions: async () => (await api.get<{ data: AvailabilityException[] }>('/admin/exceptions')).data.data,
  addException: async (body: { startsAt: string; endsAt: string; reason: string }) =>
    (await api.post<{ data: AvailabilityException; affectedAppointments: number }>('/admin/exceptions', body)).data,
  removeException: async (id: string) => (await api.delete(`/admin/exceptions/${id}`)).data,
  types: async () => (await api.get<{ data: MeetingType[] }>('/admin/types')).data.data,
  updateType: async (id: string, body: Partial<MeetingType>) => (await api.patch(`/admin/types/${id}`, body)).data,
  createType: async (body: Partial<MeetingType>) => (await api.post('/admin/types', body)).data,
  clients: async () => (await api.get<{ data: Client[] }>('/admin/clients')).data.data,
  projects: async () => (await api.get<{ data: Project[] }>('/admin/projects')).data.data,
  saveProject: async (p: Partial<Project> & { userId?: string }, id?: string) =>
    id ? (await api.patch(`/admin/projects/${id}`, p)).data : (await api.post('/admin/projects', p)).data,
  deleteProject: async (id: string) => (await api.delete(`/admin/projects/${id}`)).data,
  invoices: async () => (await api.get<{ data: Invoice[] }>('/admin/invoices')).data.data,
  saveInvoice: async (i: Partial<Invoice> & { userId?: string }, id?: string) =>
    id ? (await api.patch(`/admin/invoices/${id}`, i)).data : (await api.post('/admin/invoices', i)).data,
  deleteInvoice: async (id: string) => (await api.delete(`/admin/invoices/${id}`)).data,
}
