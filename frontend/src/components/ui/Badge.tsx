import clsx from 'clsx'

interface BadgeProps {
  status: 'live' | 'beta' | 'building' | 'active' | 'proposal'
  className?: string
}

const MAP = {
  live: { label: 'Live', cls: 'badge-live' },
  beta: { label: 'Beta', cls: 'badge-beta' },
  building: { label: 'En desarrollo', cls: 'badge-building' },
  active: { label: 'Activo', cls: 'badge-active' },
  proposal: { label: 'Propuesta', cls: 'badge-proposal' },
}

export default function Badge({ status, className }: BadgeProps) {
  const { label, cls } = MAP[status]
  return <span className={clsx(cls, className)}>{label}</span>
}
