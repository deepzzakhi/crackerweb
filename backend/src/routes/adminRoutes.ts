import { Router } from 'express'
import { authenticate } from '../middlewares/auth'
import { requireAdmin } from '../middlewares/access'
import { asyncHandler } from '../middlewares/asyncHandler'
import * as a from '../controllers/adminController'

// Todo /api/admin exige un mail de ADMIN_EMAILS (403 para el resto)
const router = Router()
router.use(authenticate, requireAdmin)

router.get('/availability', asyncHandler(a.getAvailability))
router.put('/availability', asyncHandler(a.putAvailability))
router.get('/exceptions', asyncHandler(a.listExceptions))
router.post('/exceptions', asyncHandler(a.createException))
router.delete('/exceptions/:id', asyncHandler(a.deleteException))

router.get('/types', asyncHandler(a.listTypes))
router.post('/types', asyncHandler(a.createType))
router.patch('/types/:id', asyncHandler(a.updateType))

router.get('/appointments', asyncHandler(a.listAppointments))
router.get('/appointments/:id/slots', asyncHandler(a.adminSlots))
router.post('/appointments/:id/confirm', asyncHandler(a.confirmAppointment))
router.post('/appointments/:id/cancel', asyncHandler(a.adminCancelAppointment))
router.post('/appointments/:id/done', asyncHandler(a.markDone))
router.post('/appointments/:id/reschedule', asyncHandler(a.adminReschedule))
router.patch('/appointments/:id/notes', asyncHandler(a.updateNotes))

router.get('/clients', asyncHandler(a.listClients))
router.get('/projects', asyncHandler(a.listProjects))
router.post('/projects', asyncHandler(a.createProject))
router.patch('/projects/:id', asyncHandler(a.updateProject))
router.delete('/projects/:id', asyncHandler(a.deleteProject))
router.get('/invoices', asyncHandler(a.listInvoices))
router.post('/invoices', asyncHandler(a.createInvoice))
router.patch('/invoices/:id', asyncHandler(a.updateInvoice))
router.delete('/invoices/:id', asyncHandler(a.deleteInvoice))

export default router
