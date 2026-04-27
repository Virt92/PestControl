import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Visit, VisitStatus, VisitType } from '@/types'

const STORAGE_KEY = 'pc_visits'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function loadFromStorage(): Visit[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) as Visit[] : []
}

function saveToStorage(items: Visit[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export const useVisitsStore = defineStore('visits', () => {
  const visits = ref<Visit[]>(loadFromStorage())

  const activeVisits = computed(() => visits.value.filter(v => v.status === 'planned' || v.status === 'in_progress'))
  const completedVisits = computed(() => visits.value.filter(v => v.status === 'completed'))

  function getById(id: string): Visit | undefined {
    return visits.value.find(v => v.id === id)
  }

  function getByObjectId(objectId: string): Visit[] {
    return visits.value.filter(v => v.objectId === objectId)
  }

  function add(data: Omit<Visit, 'id' | 'createdAt'>) {
    const visit: Visit = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    visits.value.push(visit)
    saveToStorage(visits.value)
    return visit
  }

  function update(id: string, data: Partial<Visit>) {
    const idx = visits.value.findIndex(v => v.id === id)
    if (idx === -1) return
    visits.value[idx] = { ...visits.value[idx], ...data }
    saveToStorage(visits.value)
  }

  function remove(id: string) {
    visits.value = visits.value.filter(v => v.id !== id)
    saveToStorage(visits.value)
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

  return { visits, activeVisits, completedVisits, getById, getByObjectId, add, update, remove, search }
})
