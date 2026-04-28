import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Inspection } from '@/types'
import { api } from '@/services/api'

export const useInspectionsStore = defineStore('inspections', () => {
  const inspections = ref<Inspection[]>([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      inspections.value = await api.get<Inspection[]>('/inspections')
    } finally {
      loading.value = false
    }
  }

  async function fetchByObject(objectId: string) {
    return api.get<Inspection[]>(`/inspections?objectId=${objectId}`)
  }

  async function fetchByClient(clientId: string) {
    return api.get<Inspection[]>(`/inspections?clientId=${clientId}`)
  }

  function getById(id: string): Inspection | undefined {
    return inspections.value.find(i => i.id === id)
  }

  async function add(data: Partial<Inspection>) {
    const inspection = await api.post<Inspection>('/inspections', data)
    inspections.value.unshift(inspection)
    return inspection
  }

  async function update(id: string, data: Partial<Inspection>) {
    const updated = await api.put<Inspection>(`/inspections/${id}`, data)
    const idx = inspections.value.findIndex(i => i.id === id)
    if (idx !== -1) inspections.value[idx] = updated
    return updated
  }

  async function remove(id: string) {
    await api.delete(`/inspections/${id}`)
    inspections.value = inspections.value.filter(i => i.id !== id)
  }

  return { inspections, loading, fetchAll, fetchByObject, fetchByClient, getById, add, update, remove }
})
