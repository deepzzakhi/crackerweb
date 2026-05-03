import { Request, Response } from 'express'

// Genera datos de serie de tiempo realistas
function timeSeries(months: number, base: number, variance: number) {
  return Array.from({ length: months }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (months - 1 - i))
    return {
      month: date.toLocaleString('es', { month: 'short' }),
      value: Math.round(base + (Math.random() - 0.4) * variance + i * (base * 0.04)),
    }
  })
}

export function getOverview(_req: Request, res: Response) {
  res.json({
    success: true,
    data: {
      kpis: [
        { label: 'Ingresos del mes', value: '$128.400', change: +12.4, unit: 'USD' },
        { label: 'Proyectos activos', value: '14', change: +3, unit: '' },
        { label: 'Clientes nuevos', value: '8', change: +2, unit: '' },
        { label: 'Tasa de conversión', value: '34%', change: +5.2, unit: '%' },
      ],
      revenue: timeSeries(12, 95000, 30000),
      users: timeSeries(12, 420, 80),
    },
  })
}

export function getAnalytics(_req: Request, res: Response) {
  res.json({
    success: true,
    data: {
      funnel: [
        { stage: 'Visitas', value: 12400 },
        { stage: 'Leads', value: 3200 },
        { stage: 'Propuestas', value: 640 },
        { stage: 'Cierres', value: 218 },
      ],
      retention: [
        { month: 'M1', rate: 100 },
        { month: 'M2', rate: 82 },
        { month: 'M3', rate: 71 },
        { month: 'M4', rate: 65 },
        { month: 'M6', rate: 58 },
        { month: 'M12', rate: 47 },
      ],
      channels: [
        { name: 'Orgánico', value: 38 },
        { name: 'Referidos', value: 27 },
        { name: 'LinkedIn', value: 19 },
        { name: 'Directo', value: 16 },
      ],
      weeklyActivity: Array.from({ length: 7 }, (_, i) => ({
        day: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i],
        sessions: Math.round(200 + Math.random() * 300),
        conversions: Math.round(10 + Math.random() * 40),
      })),
    },
  })
}

export function getProjects(_req: Request, res: Response) {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'E-commerce Prometeo', client: 'Prometeo Tattoo', status: 'live', progress: 100, stack: ['React', 'Node.js', 'PostgreSQL'], budget: '$4.200', start: 'Ene 2026', end: 'Mar 2026' },
      { id: 2, name: 'Dashboard Analítico KPIs', client: 'RetailCorp SA', status: 'active', progress: 78, stack: ['React', 'Recharts', 'Python'], budget: '$6.800', start: 'Feb 2026', end: 'Abr 2026' },
      { id: 3, name: 'App Mobile Logística', client: 'TransLog SRL', status: 'active', progress: 45, stack: ['React Native', 'Express', 'MongoDB'], budget: '$9.500', start: 'Mar 2026', end: 'Jun 2026' },
      { id: 4, name: 'SaaS CRM Inmobiliario', client: 'PropTech AR', status: 'active', progress: 30, stack: ['Next.js', 'Prisma', 'Stripe'], budget: '$12.000', start: 'Mar 2026', end: 'Jul 2026' },
      { id: 5, name: 'Plataforma E-learning', client: 'EduTech Pro', status: 'proposal', progress: 0, stack: ['Vue.js', 'Laravel', 'MySQL'], budget: '$7.200', start: 'Abr 2026', end: 'Ago 2026' },
      { id: 6, name: 'API Gateway Bancario', client: 'FinBank Digital', status: 'proposal', progress: 0, stack: ['Node.js', 'Redis', 'AWS'], budget: '$18.000', start: 'May 2026', end: 'Oct 2026' },
    ],
  })
}

export function getReports(_req: Request, res: Response) {
  res.json({
    success: true,
    data: {
      monthly: timeSeries(6, 95000, 25000).map((d) => ({
        ...d,
        expenses: Math.round(d.value * 0.38),
        profit: Math.round(d.value * 0.62),
      })),
      byService: [
        { service: 'Desarrollo Web', revenue: 48000, projects: 6 },
        { service: 'Apps Mobile', revenue: 32000, projects: 3 },
        { service: 'SaaS', revenue: 28000, projects: 2 },
        { service: 'Consultoría', revenue: 20400, projects: 8 },
      ],
    },
  })
}
