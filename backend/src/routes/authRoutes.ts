import { Router } from 'express'
import { googleAuth, getMe, demoAuth, devLogin } from '../controllers/authController'
import { authenticate } from '../middlewares/auth'
import { asyncHandler } from '../middlewares/asyncHandler'

// El rate limit de /api/auth está en app.ts
const router = Router()

router.post('/google', asyncHandler(googleAuth))
router.post('/demo', demoAuth)
router.post('/dev', asyncHandler(devLogin)) // solo responde con DEV_LOGIN=true fuera de producción
router.get('/me', authenticate, asyncHandler(getMe))

export default router
