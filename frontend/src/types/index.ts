export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'USER' | 'ADMIN'
}

export interface KPI {
  label: string
  value: string
  change: number
  unit: string
}

export interface TimePoint {
  month: string
  value: number
}

export interface Project {
  id: number
  name: string
  client: string
  status: 'live' | 'active' | 'proposal'
  progress: number
  stack: string[]
  budget: string
  start: string
  end: string
}
