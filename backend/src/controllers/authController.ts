import { Request, Response } from 'express'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { env } from '../config/env'
import { prisma } from '../config/prisma'
import type { AuthRequest } from '../middlewares/auth'

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)
const googleSchema = z.object({ credential: z.string().min(20).max(4096) })

const DEMO_USER = { id: 'demo', name: 'Demo User', email: 'demo@cracker.dev', avatar: null, role: 'USER' as const }

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

    const token = jwt.sign({ userId: user.id, email: user.email }, env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1d' })
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, role: user.role } })
  } catch (err) {
    console.error('[auth] Google error:', (err as Error).message)
    res.status(401).json({ success: false, message: 'Error de autenticación con Google' })
  }
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
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, role: user.role } })
}
