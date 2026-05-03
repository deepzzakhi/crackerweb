import { Router } from 'express'
import { getOverview, getAnalytics, getProjects, getReports } from '../controllers/dashboardController'
import { authenticate } from '../middlewares/auth'

const router = Router()

router.use(authenticate)
router.get('/overview', getOverview)
router.get('/analytics', getAnalytics)
router.get('/projects', getProjects)
router.get('/reports', getReports)

export default router
