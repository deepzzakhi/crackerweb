import { Request, Response } from 'express'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { env } from '../config/env'
import { prisma } from '../config/prisma'
import type { AuthRequest } from '../middlewares/auth'
import { isAdminEmail } from '../middlewares/access'

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)
const googleSchema = z.object({ credential: z.string().min(20).max(4096) })

const DEMO_USER = { id: 'demo', name: 'Demo User', email: 'demo@cracker.dev', avatar: null, role: 'USER' as const, isAdmin: false, isDemo: true }

export async function googleAuth(req: Request, res: Response) {
  const parsed = googleSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Token de Google requerido' })
    return
  }
  if (!env.GOOGLE_CLIENT_ID) {
    res.status(503).json({ success: false, message: 'Login con Google no configurado' })
    return
  }

  try {
    const ticket = await googleClient.verifyIdToken({ idToken: parsed.data.credential, audience: env.GOOGLE_CLIENT_ID })
    const payload = ticket.getPayload()
    if (!payload?.email || !payload.email_verified) {
      res.status(400).json({ success: false, message: 'Token inválido' })
      return
    }

    // El rol no se toca en el update: un login nunca cambia permisos
    const user = await prisma.user.upsert({
      where: { email: payload.email },
      update: { name: payload.name ?? payload.email, avatar: payload.picture, googleId: payload.sub },
      create: { email: payload.email, name: payload.name ?? payload.email, avatar: payload.picture, googleId: payload.sub, role: 'USER' },
    })

    res.json({ success: true, token: firmar(user), user: publicUser(user) })
  } catch (err) {
    console.error('[auth] Google error:', (err as Error).message)
    res.status(401).json({ success: false, message: 'Error de autenticación con Google' })
  }
}

type DbUser = { id: string; name: string; email: string; avatar: string | null; role: string }
const firmar = (u: DbUser) => jwt.sign({ userId: u.id, email: u.email }, env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1d' })
// isAdmin solo sirve para mostrar el menú: el servidor vuelve a chequear la allowlist en cada request
const publicUser = (u: DbUser) => ({ id: u.id, name: u.name, email: u.email, avatar: u.avatar, role: u.role, isAdmin: isAdminEmail(u.email) })

// Login de prueba sin Google, SOLO en desarrollo (DEV_LOGIN=true y NODE_ENV distinto de production)
const devSchema = z.object({ email: z.string().trim().toLowerCase().email().max(200), name: z.string().trim().min(2).max(80).optional() })
export async function devLogin(req: Request, res: Response) {
  if (!env.DEV_LOGIN) { res.status(404).json({ success: false, message: 'No encontrado' }); return }
  const parsed = devSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ success: false, message: 'Mail inválido' }); return }
  const { email, name } = parsed.data
  const user = await prisma.user.upsert({ where: { email }, update: {}, create: { email, name: name ?? email.split('@')[0]!, role: 'USER' } })
  res.json({ success: true, token: firmar(user), user: publicUser(user) })
}

// Acceso demo: token firmado que vence en 2 h (antes era un "demo-token" fijo que servía para siempre)
export function demoAuth(_req: Request, res: Response) {
  if (!env.DEMO_MODE) {
    res.status(404).json({ success: false, message: 'Demo no disponible' })
    return
  }
  const token = jwt.sign({ userId: DEMO_USER.id, email: DEMO_USER.email, demo: true }, env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '2h' })
  res.json({ success: true, token, user: DEMO_USER })
}

export async function getMe(req: AuthRequest, res: Response) {
  if (!req.userId) { res.status(401).json({ success: false }); return }
  if (req.isDemo) { res.json({ success: true, user: DEMO_USER }); return }
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) { res.status(404).json({ success: false }); return }
  res.json({ success: true, user: publicUser(user) })
}
