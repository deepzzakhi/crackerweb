import 'dotenv/config'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import jwt from 'jsonwebtoken'
import app from '../src/app'
import { prisma } from '../src/config/prisma'
import { env } from '../src/config/env'

// Requiere la base local levantada (docker compose up -d) con migraciones y seed aplicados.
// Dos clientes piden el mismo horario a la vez: exactamente uno recibe 201 y el otro 409.

const EMAILS = ['concurrencia.a@test.local', 'concurrencia.b@test.local']
let server: Server
let base = ''

beforeAll(async () => {
  server = app.listen(0)
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`
})

afterAll(async () => {
  await prisma.appointment.deleteMany({ where: { user: { email: { in: EMAILS } } } })
  await prisma.user.deleteMany({ where: { email: { in: EMAILS } } })
  server.close()
  await prisma.$disconnect()
})

describe('reserva concurrente del mismo horario', () => {
  it('exactamente una reserva gana (201) y la otra recibe 409', { timeout: 30_000 }, async () => {
    const users = await Promise.all(EMAILS.map((email) => prisma.user.upsert({ where: { email }, update: {}, create: { email, name: email } })))
    const tokens = users.map((u) => jwt.sign({ userId: u.id, email: u.email }, env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '5m' }))

    const types = await (await fetch(`${base}/booking/types`)).json() as { data: { id: string }[] }
    const type = types.data[0]!
    // Primer día con horarios libres dentro del horizonte
    let slot: string | undefined
    for (let i = 1; i <= 14 && !slot; i++) {
      const day = new Date(Date.now() + i * 864e5).toISOString().slice(0, 10)
      const r = await (await fetch(`${base}/booking/slots?type=${type.id}&day=${day}`)).json() as { data: { slots: { startsAt: string }[] } }
      slot = r.data.slots.at(-1)?.startsAt
    }
    expect(slot).toBeDefined()

    const body = JSON.stringify({ meetingTypeId: type.id, startsAt: slot, modality: 'VIRTUAL', topic: 'Prueba de concurrencia' })
    const results = await Promise.all(tokens.map((t) => fetch(`${base}/me/appointments`, {
      method: 'POST', body, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
    }).then((r) => r.status)))

    expect(results.sort()).toEqual([201, 409])
    const stored = await prisma.appointment.count({ where: { startsAt: new Date(slot!), status: { in: ['PENDING', 'CONFIRMED'] } } })
    expect(stored).toBe(1)
  })
})
