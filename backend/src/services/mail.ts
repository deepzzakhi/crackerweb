import { env } from '../config/env'

// Envío de mails. Mientras no haya proveedor elegido (MAIL_PROVIDER=log) se registran en el log.
// Con Resend se usa su API HTTP directamente (sin sumar dependencias).

export interface Mail { to: string | string[]; subject: string; text: string; ics?: { filename: string; content: string } }

export async function sendMail(mail: Mail): Promise<void> {
  const to = Array.isArray(mail.to) ? mail.to : [mail.to]
  if (env.MAIL_PROVIDER !== 'resend' || !env.RESEND_API_KEY) {
    console.log(`[mail:log] para ${to.length} destinatario(s) · ${mail.subject}`)
    return
  }
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.MAIL_FROM, to, subject: mail.subject, text: mail.text,
        ...(mail.ics ? { attachments: [{ filename: mail.ics.filename, content: Buffer.from(mail.ics.content).toString('base64') }] } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!r.ok) console.error('[mail] Resend respondió', r.status)
  } catch (err) {
    // Un mail que falla nunca rompe la reserva
    console.error('[mail] no se pudo enviar:', (err as Error).message)
  }
}

const icsDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
const icsText = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

/** Archivo .ics (RFC 5545) para "Agregar a mi calendario" */
export function buildIcs(a: { id: string; startsAt: Date; endsAt: Date; title: string; description: string; cancelled?: boolean }) {
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cracker Software//Agenda//ES', 'CALSCALE:GREGORIAN',
    `METHOD:${a.cancelled ? 'CANCEL' : 'PUBLISH'}`,
    'BEGIN:VEVENT',
    `UID:${a.id}@cracker`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(a.startsAt)}`,
    `DTEND:${icsDate(a.endsAt)}`,
    `SUMMARY:${icsText(a.title)}`,
    `DESCRIPTION:${icsText(a.description)}`,
    `STATUS:${a.cancelled ? 'CANCELLED' : 'CONFIRMED'}`,
    'END:VEVENT', 'END:VCALENDAR', '',
  ].join('\r\n')
}

/** "jueves, 6 de noviembre, 10:30 (hora de Argentina)" */
export function fmtLocal(d: Date) {
  const f = new Intl.DateTimeFormat('es-AR', { timeZone: env.BUSINESS_TZ, weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hour12: false })
  return `${f.format(d)} (hora de Argentina)`
}
