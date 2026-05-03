import { createBrowserRouter, Navigate } from 'react-router-dom'
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
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
