import { Router } from 'express'
import { googleAuth, getMe } from '../controllers/authController'
import { authenticate } from '../middlewares/auth'

const router = Router()

router.post('/google', googleAuth)
router.get('/me', authenticate, getMe)

export default router
