import clsx from 'clsx'

// Símbolo "Pulso": tres arcos abiertos que salen del núcleo (la C de Cracker)
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <g fill="none" strokeLinecap="round">
        <path d="M95.4 41 A40 40 0 1 0 95.4 79" stroke="currentColor" strokeWidth="9" />
        <path d="M83.6 46.4 A27 27 0 1 0 83.6 73.6" stroke="currentColor" strokeOpacity=".55" strokeWidth="8" />
        <path d="M71.8 51.8 A14 14 0 1 0 71.8 68.2" className="text-accent" stroke="currentColor" strokeWidth="8" />
      </g>
      <circle cx="60" cy="60" r="5" className="text-accent" fill="currentColor" />
    </svg>
  )
}

// Logo completo: símbolo + "cracker" en minúscula
export default function Logo({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={clsx('inline-flex items-center gap-2 font-display font-medium tracking-tight text-text', {
      'text-base': size === 'sm', 'text-xl': size === 'md', 'text-2xl': size === 'lg',
    }, className)}>
      <LogoMark className={clsx({ 'w-6 h-6': size === 'sm', 'w-7 h-7': size === 'md', 'w-9 h-9': size === 'lg' })} />
      cracker
    </span>
  )
}
