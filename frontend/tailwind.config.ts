import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Los colores salen de variables CSS (styles/globals.css): cambian con el modo claro/oscuro
        background: 'rgb(var(--c-bg) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--c-surface-2) / <alpha-value>)',
        border: 'rgb(var(--c-border) / <alpha-value>)',
        text: 'rgb(var(--c-text) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        'accent-dim': 'rgb(var(--c-accent-dim) / <alpha-value>)',
        'accent-light': 'rgb(var(--c-accent-light) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Geist', 'system-ui', 'sans-serif'],
        body: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease forwards',
        blink: 'blink 1s step-end infinite',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        blink: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
} satisfies Config
