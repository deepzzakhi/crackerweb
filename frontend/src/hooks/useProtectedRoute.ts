import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function useProtectedRoute() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true })
  }, [isAuthenticated, navigate])
  return isAuthenticated
}
