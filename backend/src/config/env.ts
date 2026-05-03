import 'dotenv/config'

function get(key: string, fallback?: string): string {
  const val = process.env[key] ?? fallback
  if (!val) throw new Error(`Missing env variable: ${key}`)
  return val
}

export const env = {
  PORT: process.env.PORT ?? '4002',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  DATABASE_URL: get('DATABASE_URL'),
  JWT_SECRET: get('JWT_SECRET'),
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? '',
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173',
}
