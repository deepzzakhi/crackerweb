import { useCallback, useEffect, useState } from 'react'
import { Cargando, ErrorBox, Vacio, EstadoFactura } from '../../components/booking/ui'
import { getMyInvoices, type Invoice } from '../../services/booking'
import { fecha, pesos } from '../../lib/fechas'

// Estado de cuenta del cliente: presupuestos y facturas (solo lectura, sin pagos online todavía)
export default function Finanzas() {
  const [items, setItems] = useState<Invoice[]>([])
  const [estado, setEstado] = useState<'loading' | 'ok' | 'error'>('loading')

  const cargar = useCallback(async () => {
    setEstado('loading')
    try { setItems(await getMyInvoices()); setEstado('ok') } catch { setEstado('error') }
  }, [])
  useEffect(() => { void cargar() }, [cargar])

  if (estado === 'loading') return <Cargando />
  if (estado === 'error') return <ErrorBox mensaje="No pudimos cargar tu estado de cuenta." onRetry={() => void cargar()} />
  if (!items.length) return <Vacio titulo="No hay presupuestos ni facturas" texto="Cuando te enviemos uno, lo vas a ver acá." />

  // Totales por moneda: lo pendiente (enviado o vencido) y lo pagado
  const totales = (filtro: (i: Invoice) => boolean) => Object.entries(items.filter((i) => i.kind === 'INVOICE' && filtro(i))
    .reduce<Record<string, number>>((acc, i) => ({ ...acc, [i.currency]: (acc[i.currency] ?? 0) + i.amountCents }), {}))
  const pendiente = totales((i) => i.status === 'SENT' || i.status === 'OVERDUE')
  const pagado = totales((i) => i.status === 'PAID')
  const vencidas = items.filter((i) => i.status === 'OVERDUE').length

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-3">
        <Tarjeta titulo="A pagar" valor={pendiente.length ? pendiente.map(([c, v]) => pesos(v, c)).join(' + ') : pesos(0)} />
        <Tarjeta titulo="Pagado" valor={pagado.length ? pagado.map(([c, v]) => pesos(v, c)).join(' + ') : pesos(0)} />
        <Tarjeta titulo="Vencidas" valor={String(vencidas)} alerta={vencidas > 0} />
      </div>

      <div className="overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <caption className="sr-only">Presupuestos y facturas</caption>
          <thead className="bg-surface">
            <tr className="text-left font-mono text-xs text-muted">
              <th scope="col" className="py-3 px-3 font-normal">Comprobante</th>
              <th scope="col" className="py-3 px-3 font-normal">Concepto</th>
              <th scope="col" className="py-3 px-3 font-normal text-right">Monto</th>
              <th scope="col" className="py-3 px-3 font-normal">Vence</th>
              <th scope="col" className="py-3 px-3 font-normal">Estado</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-t border-border">
                <td className="py-3 px-3 font-mono text-xs text-text whitespace-nowrap">{i.kind === 'QUOTE' ? 'Presupuesto' : 'Factura'} {i.number}</td>
                <td className="py-3 px-3 font-body text-text min-w-[12rem]">
                  {i.concept}
                  {i.pdfUrl && <a href={i.pdfUrl} target="_blank" rel="noopener noreferrer" className="block font-mono text-xs text-accent-light hover:underline mt-0.5">Ver PDF ↗</a>}
                </td>
                <td className="py-3 px-3 font-mono text-text text-right tabular-nums whitespace-nowrap">{pesos(i.amountCents, i.currency)}</td>
                <td className="py-3 px-3 font-mono text-xs text-muted whitespace-nowrap">{i.dueDate ? fecha(i.dueDate) : '—'}</td>
                <td className="py-3 px-3"><EstadoFactura estado={i.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Tarjeta({ titulo, valor, alerta }: { titulo: string; valor: string; alerta?: boolean }) {
  return (
    <div className="card p-4">
      <p className="font-mono text-xs text-muted">{titulo}</p>
      <p className={`font-display font-medium text-xl mt-1 tabular-nums ${alerta ? 'text-red-300' : 'text-text'}`}>{valor}</p>
    </div>
  )
}
