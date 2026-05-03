import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

function LoginContent() {
  const { setAuth, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Ingresar — Cracker'
    if (isAuthenticated) navigate('/dashboard')
  }, [isAuthenticated, navigate])

  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return
    try {
      const { data } = await api.post('/auth/google', { credential: credentialResponse.credential })
      setAuth(data.user, data.token)
      navigate('/dashboard')
    } catch {
      console.error('Error de autenticación')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-accent/3 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-sm w-full">
        <Link to="/" className="font-display font-extrabold text-2xl tracking-tighter text-text block text-center mb-12">
          CRACKER<span className="text-accent animate-blink">_</span>
        </Link>

        <div className="card p-8">
          <h1 className="font-display font-bold text-2xl text-text tracking-tight mb-2">Acceder al dashboard</h1>
          <p className="font-body text-sm text-muted mb-8 leading-relaxed">
            Ingresá con tu cuenta de Google para ver el demo de lo que Cracker construye.
          </p>

          <div className="space-y-4">
            {GOOGLE_CLIENT_ID ? (
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => console.error('Google login error')}
                theme="filled_black"
                size="large"
                width="100%"
                text="continue_with"
                shape="rectangular"
              />
            ) : (
              <div className="border border-border p-4 text-center">
                <p className="font-mono text-xs text-muted mb-2">Google OAuth no configurado</p>
                <p className="font-mono text-xs text-muted/50">Agregá VITE_GOOGLE_CLIENT_ID en .env</p>
                <button
                  onClick={() => {
                    setAuth({ id: 'demo', name: 'Demo User', email: 'demo@cracker.dev', role: 'USER' }, 'demo-token')
                    navigate('/dashboard')
                  }}
                  className="btn-primary w-full justify-center mt-4 text-xs"
                >
                  Entrar en modo demo →
                </button>
              </div>
            )}
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
