import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { env } from './config/env'
import { errorHandler } from './middlewares/errorHandler'
import { notFound } from './middlewares/notFound'
import router from './routes/index'

const app = express()

// Detrás de Render/Vercel el TLS termina en un solo hop de proxy.
// Sin esto, req.ip es la IP del balanceador y el rate limit pasa a ser global.
if (env.TRUST_PROXY > 0) app.set('trust proxy', env.TRUST_PROXY)
app.disable('x-powered-by')

app.use(helmet())
// Auth por header Bearer (sin cookies): no hace falta credentials
app.use(cors({ origin: env.FRONTEND_URLS, methods: ['GET', 'POST'], allowedHeaders: ['Content-Type', 'Authorization'] }))
if (env.NODE_ENV !== 'production') app.use(morgan('dev'))
app.use(express.json({ limit: '32kb' }))

const rateLimitDefaults = {
  standardHeaders: 'draft-7' as const,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiadas solicitudes. Intentá de nuevo más tarde.' },
}

// Límites por tipo de tráfico: un abuso del formulario no debe tumbar la API.
app.use('/api/auth', rateLimit({ ...rateLimitDefaults, windowMs: 15 * 60 * 1000, max: 20 }))
app.use('/api/contact', rateLimit({ ...rateLimitDefaults, windowMs: 60 * 60 * 1000, max: 5 }))
app.use('/api', rateLimit({ ...rateLimitDefaults, windowMs: 15 * 60 * 1000, max: 300 }))

app.use('/api', router)
app.use(notFound)
app.use(errorHandler)

export default app
