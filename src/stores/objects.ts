import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SiteObject, ObjectStatus } from '@/types'
import { api } from '@/services/api'

export const useObjectsStore = defineStore('objects', () => {
  const objects = ref<SiteObject[]>([])
  const loading = ref(false)

  const activeObjects = computed(() => objects.value.filter(o => o.status === 'active'))

  async function fetchAll() {
    loading.value = true
    try {
      objects.value = await api.get<SiteObject[]>('/objects')
    } finally {
      loading.value = false
    }
  }

  function getById(id: string): SiteObject | undefined {
    return objects.value.find(o => o.id === id)
  }

  function getByClientId(clientId: string): SiteObject[] {
    return objects.value.filter(o => o.clientId === clientId)
  }

  async function add(data: Omit<SiteObject, 'id' | 'createdAt' | 'updatedAt'>) {
    const obj = await api.post<SiteObject>('/objects', data)
    objects.value.unshift(obj)
    return obj
  }

  async function update(id: string, data: Partial<SiteObject>) {
    const updated = await api.put<SiteObject>(`/objects/${id}`, data)
    const idx = objects.value.findIndex(o => o.id === id)
    if (idx !== -1) objects.value[idx] = updated
    return updated
  }

  async function remove(id: string) {
    await api.delete(`/objects/${id}`)
    objects.value = objects.value.filter(o => o.id !== id)
  }

  function search(query: string, clientId?: string, status?: ObjectStatus): SiteObject[] {
    const q = query.toLowerCase()
    return objects.value.filter(o => {
      const matchesQuery = !q ||
        o.name.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q)
      const matchesClient = !clientId || o.clientId === clientId
      const matchesStatus = !status || o.status === status
      return matchesQuery && matchesClient && matchesStatus
    })
  }

  return { objects, loading, activeObjects, getById, getByClientId, fetchAll, add, update, remove, search }
})
