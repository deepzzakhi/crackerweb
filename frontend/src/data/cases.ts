// Casos reales. Las cifras salen de los proyectos (no inventar métricas ni testimonios).
export const CASES = [
  {
    id: 'prometeo',
    title: 'Prometeo Tattoo',
    category: 'E-Commerce',
    client: 'Tienda de insumos de tatuaje — Buenos Aires',
    description: 'Tienda online completa: catálogo con filtros, carrito, checkout con MercadoPago y panel de administración para productos, stock y órdenes. El stock se descuenta en la misma operación que el pago, así nunca se vende lo que no hay.',
    result: 'Tienda propia en producción, con pagos y panel de administración',
    metrics: [
      { label: 'Pagos', value: 'MercadoPago' },
      { label: 'Stock', value: 'Sin sobreventa' },
      { label: 'Gestión', value: 'Panel propio' },
    ],
    stack: ['React', 'TypeScript', 'Node.js', 'Prisma', 'PostgreSQL', 'MercadoPago'],
    color: '#7aa7ff',
  },
  {
    id: 'central-mantenimiento',
    title: 'Central Mantenimiento App',
    category: 'App interna',
    client: 'Carrefour Argentina — Mantenimiento',
    description: 'Portal web que reúne en un solo link las apps del equipo de mantenimiento: relevamiento de frío alimentario con dashboard, control de acceso en portería y reclamos a proveedores. Reemplazó planillas sueltas por una base única, con historial de cambios y backup semanal automático.',
    result: 'Un solo link para 3 apps que el equipo usa todos los días',
    metrics: [
      { label: 'Apps integradas', value: '3' },
      { label: 'Ingresos registrados', value: '2.600+' },
      { label: 'Backup', value: 'Semanal' },
    ],
    stack: ['JavaScript', 'Supabase', 'PostgreSQL', 'Express', 'Vercel', 'Apps Script'],
    color: '#5eead4',
  },
  {
    id: 'automatizacion-sap',
    title: 'Integración de datos SAP',
    category: 'Automatización',
    client: 'Retail — Mantenimiento y eficiencia energética',
    description: 'Proceso automático que junta 6 reportes de SAP que antes se cruzaban a mano, aplica reglas de negocio, elimina duplicados y deja una base lista para los tableros. Los cambios pasan a producción de forma controlada, sin romper lo que ya usa el equipo.',
    result: '6 fuentes de SAP unificadas en un solo proceso automático',
    metrics: [
      { label: 'Fuentes SAP', value: '6' },
      { label: 'Duplicados', value: 'Depurados' },
      { label: 'Carga manual', value: 'Eliminada' },
    ],
    stack: ['Google Apps Script', 'Google Sheets', 'SAP', 'Python', 'Looker Studio'],
    color: '#fdba74',
  },
]
