import { motion } from 'framer-motion'
import type { KPI } from '../../types'

interface Props { kpi: KPI; delay?: number }

export default function KPICard({ kpi, delay = 0 }: Props) {
  const up = kpi.change > 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="card p-5"
    >
      <p className="font-mono text-xs text-muted mb-3">{kpi.label}</p>
      <p className="font-display font-medium text-3xl text-text leading-none mb-3">{kpi.value}</p>
      <div className={`inline-flex items-center gap-1 font-mono text-xs px-2 py-1 border ${up ? 'border-accent/30 text-accent bg-accent/5' : 'border-red-500/30 text-red-400 bg-red-500/5'}`}>
        <span>{up ? '↑' : '↓'}</span>
        <span>{up ? '+' : ''}{kpi.change}{kpi.unit === '%' ? 'pp' : ''} este mes</span>
      </div>
    </motion.div>
  )
}
