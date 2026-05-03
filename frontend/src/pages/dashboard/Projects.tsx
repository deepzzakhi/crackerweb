import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../../services/api'
import Badge from '../../components/ui/Badge'
import type { Project } from '../../types'

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filter, setFilter] = useState<'all' | 'live' | 'active' | 'proposal'>('all')

  useEffect(() => {
    document.title = 'Proyectos — Cracker'
    api.get('/dashboard/projects').then(r => setProjects(r.data.data)).catch(console.error)
  }, [])

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted mb-1">Dashboard</p>
          <h1 className="font-display font-bold text-2xl text-text tracking-tight">Proyectos</h1>
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'live', 'proposal'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-mono text-xs px-3 py-1.5 border transition-colors ${filter === f ? 'border-accent text-accent bg-accent/10' : 'border-border text-muted hover:border-text/40 hover:text-text'}`}
            >
              {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : f === 'live' ? 'Live' : 'Propuestas'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Proyecto', 'Cliente', 'Estado', 'Progreso', 'Stack', 'Budget', 'Timeline'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-xs text-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors"
                >
                  <td className="px-4 py-4">
                    <p className="font-body text-sm text-text">{p.name}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-mono text-xs text-muted">{p.client}</p>
                  </td>
                  <td className="px-4 py-4">
                    <Badge status={p.status} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3 min-w-[120px]">
                      <div className="flex-1 h-1 bg-surface-2 rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="font-mono text-xs text-muted w-8">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {p.stack.slice(0, 2).map(t => (
                        <span key={t} className="font-mono text-xs text-muted/60 border border-border px-1.5 py-0.5">{t}</span>
                      ))}
                      {p.stack.length > 2 && <span className="font-mono text-xs text-muted/40">+{p.stack.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-xs text-accent">{p.budget}</span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-mono text-xs text-muted whitespace-nowrap">{p.start} → {p.end}</p>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center font-mono text-xs text-muted">No hay proyectos en este estado</div>
        )}
      </div>
    </div>
  )
}
