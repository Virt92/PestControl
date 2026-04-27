import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SiteObject, ObjectStatus } from '@/types'

const STORAGE_KEY = 'pc_objects'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function loadFromStorage(): SiteObject[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) as SiteObject[] : []
}

function saveToStorage(items: SiteObject[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export const useObjectsStore = defineStore('objects', () => {
  const objects = ref<SiteObject[]>(loadFromStorage())

  const activeObjects = computed(() => objects.value.filter(o => o.status === 'active'))

  function getById(id: string): SiteObject | undefined {
    return objects.value.find(o => o.id === id)
  }

  function getByClientId(clientId: string): SiteObject[] {
    return objects.value.filter(o => o.clientId === clientId)
  }

  function add(data: Omit<SiteObject, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const obj: SiteObject = { ...data, id: generateId(), createdAt: now, updatedAt: now }
    objects.value.push(obj)
    saveToStorage(objects.value)
    return obj
  }

  function update(id: string, data: Partial<SiteObject>) {
    const idx = objects.value.findIndex(o => o.id === id)
    if (idx === -1) return
    objects.value[idx] = { ...objects.value[idx], ...data, updatedAt: new Date().toISOString() }
    saveToStorage(objects.value)
  }

  function remove(id: string) {
    objects.value = objects.value.filter(o => o.id !== id)
    saveToStorage(objects.value)
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

  return { objects, activeObjects, getById, getByClientId, add, update, remove, search }
})
