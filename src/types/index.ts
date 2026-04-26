export interface Client {
  id: string
  companyName: string
  contactPerson: string
  phone: string
  email: string
  type: 'b2b' | 'b2c'
  status: 'active' | 'inactive'
  createdAt: string
}

export interface SiteObject {
  id: string
  clientId: string
  name: string
  address: string
  type: string
  monitoringPointsCount: number
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
}

export interface MonitoringPoint {
  id: string
  objectId: string
  tagId: string
  type: 'trap' | 'bait_station' | 'feeder' | 'control_point'
  zone: string
  floor: string
  positionX: number
  positionY: number
  status: 'active' | 'inactive' | 'triggered' | 'maintenance'
  lastCheckedAt: string | null
}

export interface Visit {
  id: string
  objectId: string
  assignedTo: string
  scheduledAt: string
  completedAt: string | null
  type: 'inspection' | 'treatment' | 'monitoring_check' | 'follow_up'
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  notes: string
}

export interface CheckResult {
  id: string
  visitId: string
  pointId: string
  activity: boolean
  activityLevel: number
  consumptionPercent: number | null
  consumptionGrams: number | null
  photos: string[]
  correctiveAction: string
  checkedAt: string
}
