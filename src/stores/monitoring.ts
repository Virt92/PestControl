import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MonitoringPoint, CheckResult, PointStatus, PointType } from '@/types'
import { api } from '@/services/api'

export const useMonitoringStore = defineStore('monitoring', () => {
  const points = ref<MonitoringPoint[]>([])
  const checks = ref<CheckResult[]>([])
  const loading = ref(false)

  const activePoints = computed(() => points.value.filter(p => p.status === 'active'))
  const triggeredPoints = computed(() => points.value.filter(p => p.status === 'triggered'))

  async function fetchPoints() {
    loading.value = true
    try {
      points.value = await api.get<MonitoringPoint[]>('/points')
    } finally {
      loading.value = false
    }
  }

  async function fetchChecks() {
    checks.value = await api.get<CheckResult[]>('/checks')
  }

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

  async function addPoint(data: Omit<MonitoringPoint, 'id'>) {
    const point = await api.post<MonitoringPoint>('/points', data)
    points.value.push(point)
    return point
  }

  async function updatePoint(id: string, data: Partial<MonitoringPoint>) {
    const updated = await api.put<MonitoringPoint>(`/points/${id}`, data)
    const idx = points.value.findIndex(p => p.id === id)
    if (idx !== -1) points.value[idx] = updated
    return updated
  }

  async function removePoint(id: string) {
    await api.delete(`/points/${id}`)
    points.value = points.value.filter(p => p.id !== id)
  }

  async function addCheck(data: Omit<CheckResult, 'id'>) {
    const check = await api.post<CheckResult>('/checks', data)
    checks.value.unshift(check)

    if (data.pointId) {
      const point = points.value.find(p => p.id === data.pointId)
      if (point) {
        await updatePoint(point.id, {
          lastCheckedAt: data.checkedAt,
          status: data.activity ? 'triggered' : 'active'
        })
      }
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
    points, checks, loading, activePoints, triggeredPoints,
    getPointById, getPointsByObjectId, getChecksByPointId, getChecksByVisitId,
    fetchPoints, fetchChecks, addPoint, updatePoint, removePoint, addCheck, searchPoints
  }
})
