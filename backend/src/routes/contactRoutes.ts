import { Router } from 'express'
import { createContact } from '../controllers/contactController'
import { asyncHandler } from '../middlewares/asyncHandler'

// El rate limit de /api/contact (5 por hora por IP) está en app.ts
const router = Router()
router.post('/', asyncHandler(createContact))

export default router
