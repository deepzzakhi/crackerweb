import { PrismaClient } from '@prisma/client'

// Una sola instancia para toda la app (evita agotar el pool de conexiones)
export const prisma = new PrismaClient()
