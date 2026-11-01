import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import Logo from '../components/ui/Logo'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''
// Login de prueba sin Google: solo en `npm run dev` y con VITE_DEV_LOGIN=true (el backend también lo exige)
const DEV_LOGIN = import.meta.env.DEV && import.meta.env.VITE_DEV_LOGIN === 'true'

/** Solo rutas internas (evita redirecciones a otros sitios) */
const destinoSeguro = (n: string | null) => (n && n.startsWith('/') && !n.startsWith('//') ? n : null)

function LoginContent() {
  const { setAuth, isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = destinoSeguro(params.get('next'))
  // Si viene de la agenda o de "Mi cuenta", hace falta una cuenta real (no la demo)
  const cuentaReal = !!next

  const [error, setError] = useState('')
  const [entrando, setEntrando] = useState(false)
  const [devEmail, setDevEmail] = useState('')

  useEffect(() => {
    document.title = cuentaReal ? 'Ingresar a tu cuenta — Cracker' : 'Ingresar — Cracker'
    if (!isAuthenticated) return
    if (cuentaReal && user?.isDemo) return // está en la demo: tiene que entrar con su cuenta
    navigate(next ?? (user?.isDemo ? '/dashboard' : '/cuenta'), { replace: true })
  }, [isAuthenticated, user, next, cuentaReal, navigate])

  const entrar = async (fn: () => Promise<{ data: { user: never; token: string } }>, fallback: string) => {
    setEntrando(true); setError('')
    try {
      if (user?.isDemo) logout()
      const { data } = await fn()
      setAuth(data.user, data.token)
    } catch { setError(fallback) } finally { setEntrando(false) }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      <div className="relative z-10 max-w-sm w-full">
        <Link to="/" aria-label="Cracker, ir al inicio" className="flex justify-center mb-12"><Logo size="lg" /></Link>

        <div className="card p-8">
          <h1 className="font-display font-medium text-2xl text-text tracking-tight mb-2">{cuentaReal ? 'Ingresá a tu cuenta' : 'Acceder al dashboard'}</h1>
          <p className="font-body text-sm text-muted mb-8 leading-relaxed">
            {cuentaReal
              ? 'Con tu cuenta de Google podés agendar reuniones y ver tus citas, proyectos y facturas.'
              : 'Ingresá con tu cuenta de Google o mirá la demo con datos de ejemplo.'}
          </p>

          <div className="space-y-4">
            {cuentaReal && user?.isDemo && <p className="font-body text-xs text-amber-300 border border-amber-400/40 px-4 py-2">Estás en el modo demo. Para continuar, entrá con tu cuenta.</p>}
            {error && <p role="alert" className="font-body text-sm text-red-300 border border-red-500/40 bg-red-500/5 px-4 py-2">{error}</p>}
            {GOOGLE_CLIENT_ID ? (
              <GoogleLogin
                onSuccess={(r) => r.credential && void entrar(() => api.post('/auth/google', { credential: r.credential }), 'No se pudo ingresar con Google. Probá de nuevo.')}
                onError={() => setError('No se pudo ingresar con Google. Probá de nuevo.')}
                theme="filled_black" size="large" width="100%" text="continue_with" shape="rectangular"
              />
            ) : cuentaReal && !DEV_LOGIN && <p className="font-body text-sm text-muted">El ingreso con Google todavía no está configurado.</p>}

            {DEV_LOGIN && (
              <form className="border border-dashed border-amber-400/50 p-3 space-y-2" onSubmit={(e) => { e.preventDefault(); void entrar(() => api.post('/auth/dev', { email: devEmail }), 'No se pudo entrar (¿DEV_LOGIN=true en el backend?)') }}>
                <label htmlFor="dev-email" className="block font-mono text-xs text-amber-300">Solo desarrollo: entrar como</label>
                <input id="dev-email" type="email" required className="input min-h-11" value={devEmail} onChange={(e) => setDevEmail(e.target.value)} placeholder="cliente@prueba.local" />
                <button type="submit" disabled={entrando} className="btn-secondary w-full justify-center text-xs min-h-11">Entrar</button>
              </form>
            )}

            {!cuentaReal && (
              <button onClick={() => void entrar(() => api.post('/auth/demo'), 'La demo no está disponible ahora. Probá en un minuto (el servidor puede estar despertando).')}
                disabled={entrando} className="btn-primary w-full justify-center text-xs min-h-11">
                {entrando ? 'Entrando…' : 'Entrar en modo demo →'}
              </button>
            )}
          </div>

          {!cuentaReal && <p className="font-body text-xs text-muted text-center mt-6">La demo muestra datos ficticios.</p>}
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="font-body text-xs text-muted hover:text-text transition-colors">← Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || 'placeholder'}>
      <LoginContent />
    </GoogleOAuthProvider>
  )
}
