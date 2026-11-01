import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import { env } from '../config/env'

interface HttpError extends Error {
  status?: number
  statusCode?: number
}

const PRISMA_ERRORS: Record<string, { status: number; message: string }> = {
  P2002: { status: 409, message: 'El recurso ya existe' },
  P2025: { status: 404, message: 'Recurso no encontrado' },
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // Log completo del lado servidor (stack incluido), nunca al cliente.
  console.error('[error]', err instanceof Error ? err.stack ?? err.message : err)

  if (err instanceof ZodError) {
    res.status(400).json({ success: false, message: 'Datos inválidos', errors: err.flatten() })
    return
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const known = PRISMA_ERRORS[err.code]
    if (known) {
      res.status(known.status).json({ success: false, message: known.message })
      return
    }
  }

  const error = err as HttpError & { type?: string }
  // Errores del parser de JSON (cuerpo roto o demasiado grande): mensaje propio, sin detalles del parser
  if (error.type === 'entity.parse.failed') { res.status(400).json({ success: false, message: 'JSON inválido' }); return }
  if (error.type === 'entity.too.large') { res.status(413).json({ success: false, message: 'Solicitud demasiado grande' }); return }

  const status = error.status ?? error.statusCode ?? 500
  // Solo exponemos el mensaje en errores 4xx; los 5xx se mantienen genéricos
  // para no filtrar detalles de Prisma, rutas o infraestructura.
  const message =
    status < 500 && error.message ? error.message : 'Error interno del servidor'

  res.status(status).json({
    success: false,
    message,
    ...(env.NODE_ENV === 'production' ? {} : { detail: err instanceof Error ? err.message : String(err) }),
  })
}
