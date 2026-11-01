import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { authenticate, optionalAuthenticate } from '../middlewares/auth'
import { requireRealUser } from '../middlewares/access'
import { asyncHandler } from '../middlewares/asyncHandler'
import {
  listMeetingTypes, getSlots, createAppointment, myAppointments, cancelAppointment,
  rescheduleAppointment, appointmentIcs, myProjects, myInvoices,
} from '../controllers/bookingController'

const limiter = (max: number, windowMin: number) => rateLimit({
  windowMs: windowMin * 60 * 1000, max, standardHeaders: 'draft-7', legacyHeaders: false,
  message: { success: false, message: 'Demasiados intentos. Probá en unos minutos.' },
})

// Público: tipos de reunión y horarios libres
export const bookingPublic = Router()
bookingPublic.get('/types', asyncHandler(listMeetingTypes))
bookingPublic.get('/slots', limiter(120, 15), optionalAuthenticate, asyncHandler(getSlots))

// Cliente con cuenta real (la sesión demo no entra)
export const me = Router()
me.use(authenticate, requireRealUser)
me.get('/appointments', asyncHandler(myAppointments))
me.post('/appointments', limiter(10, 60), asyncHandler(createAppointment))
me.post('/appointments/:id/cancel', limiter(20, 60), asyncHandler(cancelAppointment))
me.post('/appointments/:id/reschedule', limiter(20, 60), asyncHandler(rescheduleAppointment))
me.get('/appointments/:id/ics', asyncHandler(appointmentIcs))
me.get('/projects', asyncHandler(myProjects))
me.get('/invoices', asyncHandler(myInvoices))
