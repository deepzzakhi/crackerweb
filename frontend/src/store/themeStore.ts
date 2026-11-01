import { create } from 'zustand'

export type Theme = 'light' | 'dark'
const KEY = 'cracker-theme'

function inicial(): Theme {
  try {
    const t = localStorage.getItem(KEY)
    if (t === 'light' || t === 'dark') return t
  } catch { /* sin localStorage */ }
  return 'dark' // la marca es negra: oscuro por defecto
}

function aplicar(theme: Theme) {
  const html = document.documentElement
  html.classList.add('theme-transition')
  html.classList.toggle('light', theme === 'light')
  window.setTimeout(() => html.classList.remove('theme-transition'), 300)
}

interface ThemeState {
  theme: Theme
  toggle: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: inicial(),
  toggle: () => {
    const theme: Theme = get().theme === 'dark' ? 'light' : 'dark'
    try { localStorage.setItem(KEY, theme) } catch { /* sin localStorage */ }
    aplicar(theme)
    set({ theme })
  },
}))
