import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MonitoringPoint, CheckResult, PointStatus, PointType } from '@/types'

const POINTS_KEY = 'pc_points'
const CHECKS_KEY = 'pc_checks'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function loadPoints(): MonitoringPoint[] {
  const raw = localStorage.getItem(POINTS_KEY)
  return raw ? JSON.parse(raw) as MonitoringPoint[] : []
}

function savePoints(items: MonitoringPoint[]) {
  localStorage.setItem(POINTS_KEY, JSON.stringify(items))
}

function loadChecks(): CheckResult[] {
  const raw = localStorage.getItem(CHECKS_KEY)
  return raw ? JSON.parse(raw) as CheckResult[] : []
}

function saveChecks(items: CheckResult[]) {
  localStorage.setItem(CHECKS_KEY, JSON.stringify(items))
}

export const useMonitoringStore = defineStore('monitoring', () => {
  const points = ref<MonitoringPoint[]>(loadPoints())
  const checks = ref<CheckResult[]>(loadChecks())

  const activePoints = computed(() => points.value.filter(p => p.status === 'active'))
  const triggeredPoints = computed(() => points.value.filter(p => p.status === 'triggered'))

  function getPointById(id: string): MonitoringPoint | undefined {
    return points.value.find(p => p.id === id)
  }

  function getPointsByObjectId(objectId: string): MonitoringPoint[] {
    return points.value.filter(p => p.objectId === objectId)
  }

  function getChecksByPointId(pointId: string): CheckResult[] {
    return checks.value.filter(c => c.pointId === pointId).sort((a, b) =>
      new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime()
    )
  }

  function getChecksByVisitId(visitId: string): CheckResult[] {
    return checks.value.filter(c => c.visitId === visitId)
  }

  function addPoint(data: Omit<MonitoringPoint, 'id'>) {
    const point: MonitoringPoint = { ...data, id: generateId() }
    points.value.push(point)
    savePoints(points.value)
    return point
  }

  function updatePoint(id: string, data: Partial<MonitoringPoint>) {
    const idx = points.value.findIndex(p => p.id === id)
    if (idx === -1) return
    points.value[idx] = { ...points.value[idx], ...data }
    savePoints(points.value)
  }

  function removePoint(id: string) {
    points.value = points.value.filter(p => p.id !== id)
    savePoints(points.value)
  }

  function addCheck(data: Omit<CheckResult, 'id'>) {
    const check: CheckResult = { ...data, id: generateId() }
    checks.value.push(check)
    saveChecks(checks.value)

    const point = points.value.find(p => p.id === data.pointId)
    if (point) {
      updatePoint(point.id, {
        lastCheckedAt: data.checkedAt,
        status: data.activity ? 'triggered' : 'active'
      })
    }
    return check
  }

  function searchPoints(query: string, objectId?: string, type?: PointType, status?: PointStatus): MonitoringPoint[] {
    const q = query.toLowerCase()
    return points.value.filter(p => {
      const matchesQuery = !q ||
        p.tagId.toLowerCase().includes(q) ||
        p.zone.toLowerCase().includes(q) ||
        p.floor.toLowerCase().includes(q)
      const matchesObject = !objectId || p.objectId === objectId
      const matchesType = !type || p.type === type
      const matchesStatus = !status || p.status === status
      return matchesQuery && matchesObject && matchesType && matchesStatus
    })
  }

  return {
    points, checks, activePoints, triggeredPoints,
    getPointById, getPointsByObjectId, getChecksByPointId, getChecksByVisitId,
    addPoint, updatePoint, removePoint, addCheck, searchPoints
  }
})
