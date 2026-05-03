import { Router } from 'express'
import authRoutes from './authRoutes'
import contactRoutes from './contactRoutes'
import dashboardRoutes from './dashboardRoutes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/contact', contactRoutes)
router.use('/dashboard', dashboardRoutes)
router.get('/health', (_req, res) => res.json({ status: 'ok', service: 'cracker-api' }))

export default router
