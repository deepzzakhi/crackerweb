import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('[seed] Iniciando...')

  await prisma.user.upsert({
    where: { email: 'admin@cracker.dev' },
    update: {},
    create: {
      email: 'admin@cracker.dev',
      name: 'Cracker Admin',
      role: 'ADMIN',
    },
  })

  console.log('[seed] ✓ Usuario admin creado')
  console.log('[seed] ✓ Completado')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
