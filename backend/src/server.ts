import app from './app'
import { env } from './config/env'
import { prisma } from './config/prisma'

const server = app.listen(Number(env.PORT), '0.0.0.0', () => {
  console.log(`[cracker] API running → http://0.0.0.0:${env.PORT}`)
})

// Cierre ordenado en cada deploy de Render (manda SIGTERM): no deja conexiones colgadas
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(signal, () => {
    server.close(() => { void prisma.$disconnect().finally(() => process.exit(0)) })
    setTimeout(() => process.exit(1), 10_000).unref()
  })
}
