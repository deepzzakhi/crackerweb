import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export interface AuthRequest extends Request {
  userId?: string
  userEmail?: string
  isDemo?: boolean
}

interface Payload { userId: string; email: string; demo?: boolean }

// Ya no existe el token fijo "demo-token": la demo usa un JWT firmado y con vencimiento (POST /api/auth/demo).
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const [scheme, token] = req.headers.authorization?.split(' ') ?? []
  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ success: false, message: 'Token requerido' })
    return
  }
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] }) as Payload
    if (payload.demo && !env.DEMO_MODE) throw new Error('demo deshabilitada')
    req.userId = payload.userId
    req.userEmail = payload.email
    req.isDemo = !!payload.demo
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Token inválido' })
  }
}
