import { Request, Response } from 'express'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { env } from '../config/env'

const prisma = new PrismaClient()
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)

export async function googleAuth(req: Request, res: Response) {
  const { credential } = req.body
  if (!credential) {
    res.status(400).json({ success: false, message: 'Token de Google requerido' })
    return
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    if (!payload?.email) {
      res.status(400).json({ success: false, message: 'Token inválido' })
      return
    }

    const user = await prisma.user.upsert({
      where: { email: payload.email },
      update: {
        name: payload.name ?? payload.email,
        avatar: payload.picture,
        googleId: payload.sub,
      },
      create: {
        email: payload.email,
        name: payload.name ?? payload.email,
        avatar: payload.picture,
        googleId: payload.sub,
        role: 'USER',
      },
    })

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, role: user.role },
    })
  } catch (err) {
    console.error('[auth] Google error:', err)
    res.status(401).json({ success: false, message: 'Error de autenticación con Google' })
  }
}

export async function getMe(req: Request & { userId?: string }, res: Response) {
  if (!req.userId) { res.status(401).json({ success: false }); return }
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) { res.status(404).json({ success: false }); return }
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, role: user.role } })
}
