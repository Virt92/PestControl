import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Visit, VisitStatus, VisitType } from '@/types'
import { api } from '@/services/api'

export const useVisitsStore = defineStore('visits', () => {
  const visits = ref<Visit[]>([])
  const loading = ref(false)

  const activeVisits = computed(() => visits.value.filter(v => v.status === 'planned' || v.status === 'in_progress'))
  const completedVisits = computed(() => visits.value.filter(v => v.status === 'completed'))

  async function fetchAll() {
    loading.value = true
    try {
      visits.value = await api.get<Visit[]>('/visits')
    } finally {
      loading.value = false
    }
  }

  function getById(id: string): Visit | undefined {
    return visits.value.find(v => v.id === id)
  }

  function getByObjectId(objectId: string): Visit[] {
    return visits.value.filter(v => v.objectId === objectId)
  }

  async function add(data: Omit<Visit, 'id' | 'createdAt'>) {
    const visit = await api.post<Visit>('/visits', data)
    visits.value.unshift(visit)
    return visit
  }

  async function update(id: string, data: Partial<Visit>) {
    const updated = await api.put<Visit>(`/visits/${id}`, data)
    const idx = visits.value.findIndex(v => v.id === id)
    if (idx !== -1) visits.value[idx] = updated
    return updated
  }

  async function remove(id: string) {
    await api.delete(`/visits/${id}`)
    visits.value = visits.value.filter(v => v.id !== id)
  }

  function search(query: string, objectId?: string, status?: VisitStatus, type?: VisitType): Visit[] {
    const q = query.toLowerCase()
    return visits.value.filter(v => {
      const matchesQuery = !q ||
        v.assignedTo.toLowerCase().includes(q) ||
        v.notes.toLowerCase().includes(q)
      const matchesObject = !objectId || v.objectId === objectId
      const matchesStatus = !status || v.status === status
      const matchesType = !type || v.type === type
      return matchesQuery && matchesObject && matchesStatus && matchesType
    })
  }

  return { visits, loading, activeVisits, completedVisits, getById, getByObjectId, fetchAll, add, update, remove, search }
})
