import { DayPicker } from 'react-day-picker'
import { es } from 'react-day-picker/locale'
import clsx from 'clsx'

// Calendario mensual (react-day-picker, sin su hoja de estilos) con los tokens de Cracker.
// Solo se pueden elegir los días con horarios libres; el resto queda atenuado.
interface Props {
  month: Date
  onMonthChange: (m: Date) => void
  selected?: Date
  onSelect: (d: Date | undefined) => void
  availableDays: Set<string> // "YYYY-MM-DD"
  loading?: boolean
  highlight?: Date // cita actual al reprogramar
}

const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export default function Calendario({ month, onMonthChange, selected, onSelect, availableDays, loading, highlight }: Props) {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
  return (
    <div className={clsx('relative', loading && 'opacity-60')} aria-busy={loading}>
      <DayPicker
        mode="single"
        locale={es}
        weekStartsOn={1}
        month={month}
        onMonthChange={onMonthChange}
        selected={selected}
        onSelect={onSelect}
        startMonth={new Date(hoy.getFullYear(), hoy.getMonth())}
        disabled={(d) => loading || !availableDays.has(key(d))}
        modifiers={highlight ? { actual: highlight } : undefined}
        modifiersClassNames={{ actual: 'ring-1 ring-accent-light' }}
        showOutsideDays={false}
        classNames={{
          root: 'w-full',
          months: 'relative',
          month: 'w-full',
          month_caption: 'flex items-center h-11 mb-2 px-1',
          caption_label: 'font-display font-medium text-base text-text capitalize',
          nav: 'absolute right-0 top-0 flex gap-1',
          button_previous: 'w-11 h-11 inline-flex items-center justify-center border border-border text-text hover:border-accent disabled:opacity-30 disabled:hover:border-border',
          button_next: 'w-11 h-11 inline-flex items-center justify-center border border-border text-text hover:border-accent disabled:opacity-30 disabled:hover:border-border',
          chevron: 'w-4 h-4 fill-current',
          month_grid: 'w-full border-collapse',
          weekdays: '',
          weekday: 'font-mono text-xs text-muted font-normal uppercase pb-2 text-center',
          week: '',
          day: 'p-0.5 text-center',
          day_button: 'w-full min-h-11 aspect-square max-h-14 inline-flex items-center justify-center font-body text-sm text-text border border-transparent transition-colors hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-light disabled:cursor-not-allowed disabled:hover:border-transparent',
          selected: '[&>button]:bg-accent [&>button]:text-white [&>button]:border-accent',
          today: '[&>button]:underline [&>button]:underline-offset-4 [&>button]:decoration-accent-light',
          disabled: '[&>button]:text-muted/40',
          outside: 'invisible',
        }}
      />
    </div>
  )
}
