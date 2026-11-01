import { lazy } from 'react'
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom'
import PageWrapper from './components/layout/PageWrapper'
import DashboardLayout from './components/layout/DashboardLayout'
import Home from './pages/Home'
import Services from './pages/Services'
import Cases from './pages/Cases'
import Team from './pages/Team'
import Contact from './pages/Contact'
import Blog from './pages/Blog'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Overview from './pages/dashboard/Overview'
import Analytics from './pages/dashboard/Analytics'
import Projects from './pages/dashboard/Projects'
import Reports from './pages/dashboard/Reports'
import { useAuthStore } from './store/authStore'
// Agenda, portal y admin se cargan aparte: la home no descarga el calendario ni el panel
const Agendar = lazy(() => import('./pages/Agendar'))
const CuentaLayout = lazy(() => import('./pages/cuenta/CuentaLayout'))
const MisCitas = lazy(() => import('./pages/cuenta/MisCitas'))
const MisProyectos = lazy(() => import('./pages/cuenta/MisProyectos'))
const Finanzas = lazy(() => import('./pages/cuenta/Finanzas'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminCitas = lazy(() => import('./pages/admin/AdminCitas'))
const AdminDisponibilidad = lazy(() => import('./pages/admin/AdminDisponibilidad'))
const AdminClientes = lazy(() => import('./pages/admin/AdminClientes'))

// Dashboard demo: entra cualquiera con sesión (incluida la demo)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

// Portal y admin: solo cuentas reales. El servidor igual vuelve a validar todo.
function RequireCuenta({ admin = false, children }: { admin?: boolean; children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  const { pathname } = useLocation()
  if (!isAuthenticated || user?.isDemo) return <Navigate to={`/login?next=${encodeURIComponent(pathname)}`} replace />
  if (admin && !user?.isAdmin) return <Navigate to="/cuenta" replace />
  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PageWrapper />,
    children: [
      { index: true, element: <Home /> },
      { path: 'servicios', element: <Services /> },
      { path: 'casos', element: <Cases /> },
      { path: 'equipo', element: <Team /> },
      { path: 'contacto', element: <Contact /> },
      { path: 'blog', element: <Blog /> },
      { path: 'agendar', element: <Agendar /> },
      {
        path: 'cuenta',
        element: <RequireCuenta><CuentaLayout /></RequireCuenta>,
        children: [
          { index: true, element: <MisCitas /> },
          { path: 'proyectos', element: <MisProyectos /> },
          { path: 'finanzas', element: <Finanzas /> },
        ],
      },
      {
        path: 'admin',
        element: <RequireCuenta admin><AdminLayout /></RequireCuenta>,
        children: [
          { index: true, element: <AdminCitas /> },
          { path: 'disponibilidad', element: <AdminDisponibilidad /> },
          { path: 'clientes', element: <AdminClientes /> },
        ],
      },
    ],
  },
  { path: '/login', element: <Login /> },
  {
    path: '/dashboard',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Overview /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'proyectos', element: <Projects /> },
      { path: 'reportes', element: <Reports /> },
    ],
  },
  { path: '*', element: <NotFound /> },
])
