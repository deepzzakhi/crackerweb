import { useCallback, useEffect, useState } from 'react'
import clsx from 'clsx'
import { Cargando, ErrorBox, Vacio, Aviso, EstadoProyecto, EstadoFactura, ESTADOS_PROYECTO } from '../../components/booking/ui'
import { admin, errorMessage, type Client, type Project, type Invoice, type ProjectStatus } from '../../services/booking'
import { fecha, pesos } from '../../lib/fechas'

// Clientes que entraron con su cuenta. Acá se cargan sus proyectos y su estado de cuenta.
export default function AdminClientes() {
  const [clientes, setClientes] = useState<Client[]>([])
  const [proyectos, setProyectos] = useState<Project[]>([])
  const [facturas, setFacturas] = useState<Invoice[]>([])
  const [estado, setEstado] = useState<'loading' | 'ok' | 'error'>('loading')
  const [sel, setSel] = useState<string | null>(null)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const cargar = useCallback(async () => {
    setEstado('loading')
    try {
      const [c, p, f] = await Promise.all([admin.clients(), admin.projects(), admin.invoices()])
      setClientes(c); setProyectos(p); setFacturas(f); setEstado('ok')
      setSel((s) => s ?? c[0]?.id ?? null)
    } catch { setEstado('error') }
  }, [])
  useEffect(() => { void cargar() }, [cargar])

  if (estado === 'loading') return <Cargando />
  if (estado === 'error') return <ErrorBox mensaje="No pudimos cargar los clientes." onRetry={() => void cargar()} />
  if (!clientes.length) return <Vacio titulo="Todavía no hay clientes" texto="Aparecen acá cuando alguien entra con su cuenta (por ejemplo, al agendar una reunión)." />

  const cliente = clientes.find((c) => c.id === sel)
  const listo = (t: string) => { setAviso({ tipo: 'ok', texto: t }); void cargar() }
  const falla = (err: unknown) => setAviso({ tipo: 'error', texto: errorMessage(err) })

  return (
    <div className="grid lg:grid-cols-[16rem_minmax(0,1fr)] gap-6">
      <nav aria-label="Clientes" className="lg:border-r lg:border-border lg:pr-4">
        <label htmlFor="cli-select" className="lg:hidden block font-body text-sm text-text mb-1">Cliente</label>
        <select id="cli-select" className="input min-h-11 lg:hidden" value={sel ?? ''} onChange={(e) => setSel(e.target.value)}>
          {clientes.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.email}</option>)}
        </select>
        <ul className="hidden lg:block space-y-1">
          {clientes.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => setSel(c.id)} aria-current={c.id === sel}
                className={clsx('w-full text-left px-3 py-2 min-h-11 border-l-2', c.id === sel ? 'border-accent bg-accent/10' : 'border-transparent hover:bg-surface-2')}>
                <span className="block font-body text-sm text-text truncate">{c.name}</span>
                <span className="block font-mono text-xs text-muted truncate">{c.email}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {cliente && (
        <div className="space-y-8 min-w-0">
          {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}
          <Proyectos cliente={cliente} lista={proyectos.filter((p) => p.userId === cliente.id)} onOk={listo} onError={falla} />
          <Facturas cliente={cliente} lista={facturas.filter((f) => f.userId === cliente.id)} onOk={listo} onError={falla} />
        </div>
      )}
    </div>
  )
}

type Props<T> = { cliente: Client; lista: T[]; onOk: (t: string) => void; onError: (e: unknown) => void }
const aISO = (d: string) => (d ? new Date(`${d}T12:00:00-03:00`).toISOString() : null)
const aInput = (iso: string | null) => (iso ? iso.slice(0, 10) : '')

function Proyectos({ cliente, lista, onOk, onError }: Props<Project>) {
  const vacio = { name: '', status: 'ACTIVE' as ProjectStatus, progress: 0, stack: '', startDate: '', endDate: '', nextMilestone: '' }
  const [form, setForm] = useState(vacio)
  const [editando, setEditando] = useState<string | null>(null)

  const editar = (p: Project) => {
    setEditando(p.id)
    setForm({ name: p.name, status: p.status, progress: p.progress, stack: p.stack.join(', '), startDate: aInput(p.startDate), endDate: aInput(p.endDate), nextMilestone: p.nextMilestone })
  }
  const guardar = async () => {
    try {
      await admin.saveProject({
        userId: cliente.id, name: form.name.trim(), status: form.status, progress: Math.max(0, Math.min(100, Number(form.progress))),
        stack: form.stack.split(',').map((s) => s.trim()).filter(Boolean), startDate: aISO(form.startDate), endDate: aISO(form.endDate), nextMilestone: form.nextMilestone.trim(),
      }, editando ?? undefined)
      setForm(vacio); setEditando(null); onOk('Proyecto guardado.')
    } catch (err) { onError(err) }
  }

  return (
    <section aria-labelledby="t-proy" className="space-y-3">
      <h2 id="t-proy" className="font-display font-medium text-xl text-text">Proyectos de {cliente.name}</h2>
      {lista.length ? (
        <ul className="border border-border divide-y divide-border">
          {lista.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
              <span className="font-body text-sm text-text">{p.name} <span className="font-mono text-xs text-muted">· {p.progress}%</span></span>
              <span className="flex items-center gap-2">
                <EstadoProyecto estado={p.status} />
                <button type="button" className="btn-ghost text-xs min-h-11" onClick={() => editar(p)}>Editar</button>
                <button type="button" className="btn-ghost text-xs min-h-11 text-red-300" onClick={async () => { try { await admin.deleteProject(p.id); onOk('Proyecto borrado.') } catch (err) { onError(err) } }}>Borrar</button>
              </span>
            </li>
          ))}
        </ul>
      ) : <p className="font-body text-sm text-muted">Sin proyectos todavía.</p>}

      <form className="card p-4 grid sm:grid-cols-2 gap-3" onSubmit={(e) => { e.preventDefault(); void guardar() }}>
        <p className="sm:col-span-2 font-body text-sm text-text">{editando ? 'Editar proyecto' : 'Nuevo proyecto'}</p>
        <Campo id="p-nombre" label="Nombre"><input id="p-nombre" required minLength={2} maxLength={120} className="input min-h-11" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Campo>
        <Campo id="p-estado" label="Estado">
          <select id="p-estado" className="input min-h-11" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}>
            {Object.entries(ESTADOS_PROYECTO).map(([v, [l]]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Campo>
        <Campo id="p-avance" label="Avance (%)"><input id="p-avance" type="number" min={0} max={100} className="input min-h-11" value={form.progress} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} /></Campo>
        <Campo id="p-stack" label="Tecnologías (separadas por coma)"><input id="p-stack" className="input min-h-11" value={form.stack} onChange={(e) => setForm({ ...form, stack: e.target.value })} /></Campo>
        <Campo id="p-inicio" label="Inicio"><input id="p-inicio" type="date" className="input min-h-11" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Campo>
        <Campo id="p-fin" label="Entrega estimada"><input id="p-fin" type="date" className="input min-h-11" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Campo>
        <div className="sm:col-span-2"><Campo id="p-hito" label="Próximo hito"><input id="p-hito" maxLength={200} className="input min-h-11" value={form.nextMilestone} onChange={(e) => setForm({ ...form, nextMilestone: e.target.value })} /></Campo></div>
        <div className="sm:col-span-2 flex justify-end gap-2">
          {editando && <button type="button" className="btn-secondary text-xs py-2 px-4 min-h-11" onClick={() => { setEditando(null); setForm(vacio) }}>Cancelar</button>}
          <button type="submit" className="btn-primary text-xs py-2 px-4 min-h-11">{editando ? 'Guardar cambios' : 'Agregar proyecto'}</button>
        </div>
      </form>
    </section>
  )
}

function Facturas({ cliente, lista, onOk, onError }: Props<Invoice>) {
  const vacio = { kind: 'INVOICE' as 'INVOICE' | 'QUOTE', number: '', concept: '', monto: '', currency: 'ARS', status: 'SENT' as 'DRAFT' | 'SENT' | 'PAID', dueDate: '', pdfUrl: '' }
  const [form, setForm] = useState(vacio)
  const [editando, setEditando] = useState<string | null>(null)

  const editar = (i: Invoice) => {
    setEditando(i.id)
    setForm({ kind: i.kind, number: i.number, concept: i.concept, monto: String(i.amountCents / 100), currency: i.currency, status: i.status === 'OVERDUE' ? 'SENT' : i.status, dueDate: aInput(i.dueDate), pdfUrl: i.pdfUrl ?? '' })
  }
  const guardar = async () => {
    const monto = Math.round(Number(form.monto.replace(/\./g, '').replace(',', '.')) * 100)
    if (!Number.isFinite(monto) || monto < 0) { onError({ response: { data: { message: 'Revisá el monto (ej.: 150000 o 150000,50).' } } }); return }
    try {
      await admin.saveInvoice({ userId: cliente.id, kind: form.kind, number: form.number.trim(), concept: form.concept.trim(), amountCents: monto, currency: form.currency, status: form.status, dueDate: aISO(form.dueDate), pdfUrl: form.pdfUrl.trim() || null }, editando ?? undefined)
      setForm(vacio); setEditando(null); onOk('Comprobante guardado.')
    } catch (err) { onError(err) }
  }

  return (
    <section aria-labelledby="t-fact" className="space-y-3">
      <h2 id="t-fact" className="font-display font-medium text-xl text-text">Presupuestos y facturas</h2>
      {lista.length ? (
        <ul className="border border-border divide-y divide-border">
          {lista.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
              <span className="font-body text-sm text-text min-w-0">{i.kind === 'QUOTE' ? 'Presupuesto' : 'Factura'} {i.number} · {i.concept} <span className="font-mono text-xs text-muted">· {pesos(i.amountCents, i.currency)}{i.dueDate ? ` · vence ${fecha(i.dueDate)}` : ''}</span></span>
              <span className="flex items-center gap-2">
                <EstadoFactura estado={i.status} />
                <button type="button" className="btn-ghost text-xs min-h-11" onClick={() => editar(i)}>Editar</button>
                <button type="button" className="btn-ghost text-xs min-h-11 text-red-300" onClick={async () => { try { await admin.deleteInvoice(i.id); onOk('Comprobante borrado.') } catch (err) { onError(err) } }}>Borrar</button>
              </span>
            </li>
          ))}
        </ul>
      ) : <p className="font-body text-sm text-muted">Sin comprobantes todavía.</p>}

      <form className="card p-4 grid sm:grid-cols-2 gap-3" onSubmit={(e) => { e.preventDefault(); void guardar() }}>
        <p className="sm:col-span-2 font-body text-sm text-text">{editando ? 'Editar comprobante' : 'Nuevo comprobante'} <span className="text-muted">(los borradores no los ve el cliente)</span></p>
        <Campo id="f-tipo" label="Tipo"><select id="f-tipo" className="input min-h-11" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as 'INVOICE' | 'QUOTE' })}><option value="INVOICE">Factura</option><option value="QUOTE">Presupuesto</option></select></Campo>
        <Campo id="f-num" label="Número"><input id="f-num" required maxLength={30} className="input min-h-11" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="Ej.: 0001-00000123" /></Campo>
        <div className="sm:col-span-2"><Campo id="f-concepto" label="Concepto"><input id="f-concepto" required minLength={2} maxLength={200} className="input min-h-11" value={form.concept} onChange={(e) => setForm({ ...form, concept: e.target.value })} /></Campo></div>
        <Campo id="f-monto" label="Monto"><input id="f-monto" required inputMode="decimal" className="input min-h-11" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} placeholder="150000" /></Campo>
        <Campo id="f-moneda" label="Moneda"><select id="f-moneda" className="input min-h-11" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}><option value="ARS">Pesos</option><option value="USD">Dólares</option></select></Campo>
        <Campo id="f-estado" label="Estado"><select id="f-estado" className="input min-h-11" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'DRAFT' | 'SENT' | 'PAID' })}><option value="DRAFT">Borrador</option><option value="SENT">Enviada</option><option value="PAID">Pagada</option></select></Campo>
        <Campo id="f-vence" label="Vencimiento"><input id="f-vence" type="date" className="input min-h-11" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></Campo>
        <div className="sm:col-span-2"><Campo id="f-pdf" label="Link al PDF (opcional)"><input id="f-pdf" type="url" className="input min-h-11" value={form.pdfUrl} onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })} placeholder="https://…" /></Campo></div>
        <div className="sm:col-span-2 flex justify-end gap-2">
          {editando && <button type="button" className="btn-secondary text-xs py-2 px-4 min-h-11" onClick={() => { setEditando(null); setForm(vacio) }}>Cancelar</button>}
          <button type="submit" className="btn-primary text-xs py-2 px-4 min-h-11">{editando ? 'Guardar cambios' : 'Agregar comprobante'}</button>
        </div>
      </form>
    </section>
  )
}

function Campo({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return <div><label htmlFor={id} className="block font-body text-xs text-muted mb-1">{label}</label>{children}</div>
}
