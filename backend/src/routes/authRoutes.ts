import { Router } from 'express'
import { googleAuth, getMe, demoAuth } from '../controllers/authController'
import { authenticate } from '../middlewares/auth'
import { asyncHandler } from '../middlewares/asyncHandler'

// El rate limit de /api/auth está en app.ts
const router = Router()

router.post('/google', asyncHandler(googleAuth))
router.post('/demo', demoAuth)
router.get('/me', authenticate, asyncHandler(getMe))

export default router
