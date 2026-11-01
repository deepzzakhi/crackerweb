import { Response, NextFunction } from 'express'
import { env } from '../config/env'
import type { AuthRequest } from './auth'

// Las rutas reales (agenda, portal, admin) nunca aceptan la sesión de la demo:
// así los datos ficticios del dashboard demo no se mezclan con los reales.
export function requireRealUser(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.userId || req.isDemo) {
    res.status(401).json({ success: false, message: 'Ingresá con tu cuenta para continuar' })
    return
  }
  next()
}

export const isAdminEmail = (email?: string) => !!email && env.ADMIN_EMAILS.includes(email.toLowerCase())

// El panel admin se habilita solo para los mails de ADMIN_EMAILS (allowlist en el servidor)
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.userId || req.isDemo || !isAdminEmail(req.userEmail)) {
    res.status(403).json({ success: false, message: 'No tenés acceso a esta sección' })
    return
  }
  next()
}
