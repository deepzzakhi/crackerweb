import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import Logo from '../components/ui/Logo'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

function LoginContent() {
  const { setAuth, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Ingresar — Cracker'
    if (isAuthenticated) navigate('/dashboard')
  }, [isAuthenticated, navigate])

  const [error, setError] = useState('')
  const [entrando, setEntrando] = useState(false)

  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return
    try {
      const { data } = await api.post('/auth/google', { credential: credentialResponse.credential })
      setAuth(data.user, data.token)
      navigate('/dashboard')
    } catch {
      setError('No se pudo ingresar con Google. Probá de nuevo.')
    }
  }

  // La demo pide al servidor un token firmado que vence en 2 h (ya no hay token fijo)
  const entrarDemo = async () => {
    setEntrando(true)
    setError('')
    try {
      const { data } = await api.post('/auth/demo')
      setAuth(data.user, data.token)
      navigate('/dashboard')
    } catch {
      setError('La demo no está disponible ahora. Probá en un minuto (el servidor puede estar despertando).')
    } finally {
      setEntrando(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-accent/3 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-sm w-full">
        <Link to="/" aria-label="Cracker, ir al inicio" className="flex justify-center mb-12"><Logo size="lg" /></Link>

        <div className="card p-8">
          <h1 className="font-display font-medium text-2xl text-text tracking-tight mb-2">Acceder al dashboard</h1>
          <p className="font-body text-sm text-muted mb-8 leading-relaxed">
            Ingresá con tu cuenta de Google para ver el demo de lo que Cracker construye.
          </p>

          <div className="space-y-4">
            {error && <p className="font-mono text-xs text-red-400 border border-red-800/40 bg-red-900/10 px-4 py-2">{error}</p>}
            {GOOGLE_CLIENT_ID && (
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => setError('No se pudo ingresar con Google. Probá de nuevo.')}
                theme="filled_black"
                size="large"
                width="100%"
                text="continue_with"
                shape="rectangular"
              />
            )}
            <button onClick={entrarDemo} disabled={entrando} className="btn-primary w-full justify-center text-xs">
              {entrando ? 'Entrando…' : 'Entrar en modo demo →'}
            </button>
          </div>

          <p className="font-body text-xs text-muted text-center mt-6">
            Al ingresar aceptás ver contenido de demostración con datos ficticios.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="font-body text-xs text-muted hover:text-text transition-colors">
            ← Volver al inicio
          </Link>
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
