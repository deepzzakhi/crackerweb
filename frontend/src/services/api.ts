import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// En producción apunta al backend de Render (VITE_API_URL); en local usa el proxy de Vite
const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')
const api = axios.create({ baseURL: `${API_URL}/api`, timeout: 60_000 })

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) useAuthStore.getState().logout()
    return Promise.reject(err)
  }
)

export default api
