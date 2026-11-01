import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

// Datos iniciales de la agenda. Se puede correr varias veces sin duplicar (upsert).
const prisma = new PrismaClient()

async function main() {
  const admins = (process.env.ADMIN_EMAILS ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  if (!admins.length) throw new Error('Definí ADMIN_EMAILS en el .env antes de correr el seed')

  for (const email of admins) {
    await prisma.user.upsert({ where: { email }, update: { role: 'ADMIN' }, create: { email, name: 'Cracker', role: 'ADMIN' } })
  }

  const types = [
    { slug: 'primera-charla', name: 'Primera charla', description: 'Contanos tu idea o tu problema y vemos si lo podemos resolver.', durationMin: 30, sortOrder: 1 },
    { slug: 'seguimiento', name: 'Seguimiento de proyecto', description: 'Revisamos avances, dudas y próximos pasos de un proyecto en curso.', durationMin: 45, sortOrder: 2 },
  ]
  for (const t of types) await prisma.meetingType.upsert({ where: { slug: t.slug }, update: {}, create: t })

  // Lunes a viernes de 9 a 20 (hora de Argentina), turnos cada 30 min y 10 min de descanso entre citas
  if ((await prisma.availabilityRule.count()) === 0) {
    await prisma.availabilityRule.createMany({
      data: [1, 2, 3, 4, 5].map((weekday) => ({ weekday, startMin: 9 * 60, endMin: 20 * 60, slotMin: 30, bufferMin: 10 })),
    })
  }
  console.log(`[seed] ✓ ${admins.length} admin(s), ${types.length} tipos de reunión, horario lunes a viernes de 9 a 20`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
