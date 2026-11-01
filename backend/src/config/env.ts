import 'dotenv/config'

function get(key: string, fallback?: string): string {
  const val = process.env[key] ?? fallback
  if (!val) throw new Error(`Missing env variable: ${key}`)
  return val
}

const NODE_ENV = process.env.NODE_ENV ?? 'development'
const isProduction = NODE_ENV === 'production'

// Valores de ejemplo que NUNCA deben llegar a producción.
const PLACEHOLDER_SECRETS = new Set([
  'your_super_secret_jwt_key_here',
  'changeme',
  'secret',
  'jwt_secret',
])

const JWT_SECRET = get('JWT_SECRET')
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? ''

// Fail-fast: en producción preferimos no arrancar antes que arrancar inseguro.
if (isProduction && (JWT_SECRET.length < 32 || PLACEHOLDER_SECRETS.has(JWT_SECRET))) {
  throw new Error('[env] JWT_SECRET inseguro: usá al menos 32 caracteres aleatorios (openssl rand -base64 48)')
}
// Sin Google el login responde 503 (falla cerrado) y queda solo la demo.
if (isProduction && !GOOGLE_CLIENT_ID) {
  console.warn('[env] GOOGLE_CLIENT_ID vacío: el login con Google queda deshabilitado')
}

export const env = {
  PORT: process.env.PORT ?? '4002',
  NODE_ENV,
  IS_PROD: isProduction,
  DATABASE_URL: get('DATABASE_URL'),
  JWT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? '',
  // Una o varias URLs separadas por coma (ej.: https://crackerweb.vercel.app,http://localhost:5173)
  FRONTEND_URLS: (process.env.FRONTEND_URL ?? 'http://localhost:5173').split(',').map((s) => s.trim()).filter(Boolean),
  // Cantidad de hops de proxy confiables. Render = 1. NUNCA `true` (permite falsear X-Forwarded-For).
  TRUST_PROXY: Number(process.env.TRUST_PROXY ?? (isProduction ? 1 : 0)),
  // Acceso demo al dashboard (datos ficticios) con token firmado de 2 h. Se apaga con DEMO_MODE=false.
  DEMO_MODE: process.env.DEMO_MODE !== 'false',
  // Asistente del chat. Sin API key el chat responde 503 y la web ofrece WhatsApp directo.
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? '',
  // Para bajar costos se puede usar claude-haiku-5-5
  CHAT_MODEL: process.env.CHAT_MODEL ?? 'claude-opus-5-5',

  // ─── Agenda y portal ───
  // Mails con acceso al panel admin (separados por coma). El primero es el anfitrión de las citas.
  ADMIN_EMAILS: (process.env.ADMIN_EMAILS ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
  BUSINESS_TZ: process.env.BUSINESS_TZ ?? 'America/Argentina/Buenos_Aires',
  BOOKING_MIN_NOTICE_HOURS: Number(process.env.BOOKING_MIN_NOTICE_HOURS ?? 12),
  BOOKING_HORIZON_DAYS: Number(process.env.BOOKING_HORIZON_DAYS ?? 60),
  BOOKING_MAX_ACTIVE_PER_USER: Number(process.env.BOOKING_MAX_ACTIVE_PER_USER ?? 3),
  // Plazo para que el cliente cancele o reprograme por su cuenta
  BOOKING_CHANGE_LIMIT_HOURS: Number(process.env.BOOKING_CHANGE_LIMIT_HOURS ?? 24),
  // Login de prueba sin Google, solo en desarrollo (nunca se habilita en producción)
  DEV_LOGIN: !isProduction && process.env.DEV_LOGIN === 'true',
  // Mails: hasta elegir proveedor quedan en el log del servidor
  MAIL_PROVIDER: (process.env.MAIL_PROVIDER ?? 'log') as 'log' | 'resend',
  MAIL_FROM: process.env.MAIL_FROM ?? 'Cracker <crackersoftware@gmail.com>',
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? '',
}
