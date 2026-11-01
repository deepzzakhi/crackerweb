import { Router } from 'express'
import { chat } from '../controllers/chatController'
import { asyncHandler } from '../middlewares/asyncHandler'

// El rate limit de /api/chat (30 mensajes cada 15 min por IP) está en app.ts
const router = Router()
router.post('/', asyncHandler(chat))

export default router
