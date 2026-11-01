// Todas las fechas se muestran en hora de Argentina, sin importar dónde esté el navegador.
export const TZ = 'America/Argentina/Buenos_Aires'
export const TZ_LABEL = 'Hora de Argentina'

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('es-AR', { timeZone: TZ, ...opts })
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** "10:30" */
export const hora = (iso: string) => fmt({ hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso))
/** "Martes 3 de noviembre" */
export const diaLargo = (iso: string) => capital(fmt({ weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(iso)))
/** "mar 3 nov" */
export const diaCorto = (iso: string) => fmt({ weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(iso))
/** "3/11/2026" */
export const fecha = (iso: string) => fmt({ day: 'numeric', month: 'numeric', year: 'numeric' }).format(new Date(iso))

/** Día local "YYYY-MM-DD" de un instante */
export function diaISO(d: Date | string) {
  const p = fmt({ year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(d))
  const v = (t: string) => p.find((x) => x.type === t)?.value ?? ''
  return `${v('year')}-${v('month')}-${v('day')}`
}

/** "YYYY-MM" del mes que muestra el calendario */
export const mesISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

/** Date local (mediodía, para el calendario) a partir de "YYYY-MM-DD" */
export function diaADate(day: string) {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y!, m! - 1, d!, 12)
}

/** Inicio de un día en Argentina (UTC-3, sin horario de verano) como ISO UTC */
export const inicioDiaAR = (day: string) => new Date(`${day}T00:00:00-03:00`).toISOString()

export const minutosAHora = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
export const horaAMinutos = (h: string) => { const [a, b] = h.split(':').map(Number); return (a ?? 0) * 60 + (b ?? 0) }

export const pesos = (cents: number, currency = 'ARS') =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100)
