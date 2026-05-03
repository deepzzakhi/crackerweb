import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  projectType: z.string().min(1),
  message: z.string().min(10),
})

export async function createContact(req: Request, res: Response) {
  const result = contactSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ success: false, message: 'Datos inválidos', errors: result.error.flatten() })
    return
  }

  const msg = await prisma.contactMessage.create({ data: result.data })
  console.log(`[contact] Nuevo mensaje de ${msg.email} — ${msg.projectType}`)
  res.json({ success: true, message: 'Mensaje recibido. Te contactamos pronto.' })
}
