/* ── Enums / Literal Unions ────────────────────────────── */

export type ClientType = 'b2b' | 'b2c'
export type ClientStatus = 'active' | 'inactive'
export type ObjectStatus = 'active' | 'inactive' | 'suspended'
export type PointType = 'trap' | 'bait_station' | 'feeder' | 'control_point'
export type PointStatus = 'active' | 'inactive' | 'triggered' | 'maintenance'
export type VisitType = 'inspection' | 'treatment' | 'monitoring_check' | 'follow_up'
export type VisitStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled'
export type DocumentType = 'act' | 'monitoring_journal' | 'report' | 'service_plan' | 'inspection_report'
export type DocumentStatus = 'draft' | 'ready' | 'published' | 'archived'
export type NotificationType = 'info' | 'warning' | 'critical' | 'task'

/* ── Core Entities ────────────────────────────────────── */

export interface Client {
  id: string
  companyName: string
  contactPerson: string
  phone: string
  email: string
  address: string
  type: ClientType
  status: ClientStatus
  notes: string
  createdAt: string
  updatedAt: string
}

export interface SiteObject {
  id: string
  clientId: string
  name: string
  address: string
  type: string
  floors: number
  contactOnSite: string
  contactPhone: string
  accessNotes: string
  floorPlanUrl: string
  status: ObjectStatus
  createdAt: string
  updatedAt: string
}

export interface MonitoringPoint {
  id: string
  objectId: string
  number: number
  tagId: string
  type: PointType
  zone: string
  floor: string
  positionX: number
  positionY: number
  status: PointStatus
  installedAt: string
  lastCheckedAt: string | null
  notes: string
}

export interface Visit {
  id: string
  objectId: string
  clientId: string
  assignedTo: string
  scheduledAt: string
  completedAt: string | null
  type: VisitType
  status: VisitStatus
  notes: string
  pointsChecked: number
  pointsTotal: number
  createdAt: string
}

export interface CheckResult {
  id: string
  visitId: string
  pointId: string
  objectId: string
  activity: boolean
  activityLevel: number
  consumptionPercent: number | null
  consumptionGrams: number | null
  pestType: string
  photos: string[]
  correctiveAction: string
  equipmentStatus: string
  notes: string
  checkedAt: string
  checkedBy: string
}

export interface Document {
  id: string
  objectId: string
  clientId: string
  visitId: string | null
  type: DocumentType
  title: string
  status: DocumentStatus
  createdBy: string
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  relatedEntity: string
  relatedId: string
  read: boolean
  createdAt: string
}

export interface AuditLogEntry {
  id: string
  action: string
  entity: string
  entityId: string
  userId: string
  userName: string
  details: string
  createdAt: string
}

export interface ServicePlan {
  id: string
  objectId: string
  clientId: string
  title: string
  frequency: string
  pestTypes: string[]
  zones: string[]
  startDate: string
  endDate: string | null
  status: 'active' | 'paused' | 'completed'
  notes: string
  createdAt: string
}

/* ── Helpers ──────────────────────────────────────────── */

export const POINT_TYPE_LABELS: Record<PointType, string> = {
  trap: 'Пастка',
  bait_station: 'Приманкова станція',
  feeder: 'Годівниця',
  control_point: 'Контрольна точка'
}

export const VISIT_TYPE_LABELS: Record<VisitType, string> = {
  inspection: 'Обстеження',
  treatment: 'Обробка',
  monitoring_check: 'Перевірка точок',
  follow_up: 'Контрольний виїзд'
}

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  planned: 'Заплановано',
  in_progress: 'В роботі',
  completed: 'Завершено',
  cancelled: 'Скасовано'
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  act: 'Акт',
  monitoring_journal: 'Журнал моніторингу',
  report: 'Звіт',
  service_plan: 'План обслуговування',
  inspection_report: 'Акт обстеження'
}

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: 'Чернетка',
  ready: 'Готовий',
  published: 'Опублікований',
  archived: 'Архів'
}
