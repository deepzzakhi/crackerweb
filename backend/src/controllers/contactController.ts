import { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../config/prisma'

// Límites de largo para que nadie llene la base con mensajes gigantes
const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  projectType: z.string().trim().min(1).max(60),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(0).optional(), // honeypot: campo oculto que solo completan los bots
})

export async function createContact(req: Request, res: Response) {
  const result = contactSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ success: false, message: 'Datos inválidos' })
    return
  }
  const { website: _honeypot, ...data } = result.data
  await prisma.contactMessage.create({ data })
  // Sin el email en el log: es un dato personal
  console.log(`[contact] Nuevo mensaje — ${data.projectType}`)
  res.json({ success: true, message: 'Mensaje recibido. Te contactamos pronto.' })
}
