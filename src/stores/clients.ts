import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Client, ClientType, ClientStatus } from '@/types'

const STORAGE_KEY = 'pc_clients'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function loadFromStorage(): Client[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) as Client[] : []
}

function saveToStorage(items: Client[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export const useClientsStore = defineStore('clients', () => {
  const clients = ref<Client[]>(loadFromStorage())

  const activeClients = computed(() => clients.value.filter(c => c.status === 'active'))
  const b2bClients = computed(() => clients.value.filter(c => c.type === 'b2b'))
  const b2cClients = computed(() => clients.value.filter(c => c.type === 'b2c'))

  function getById(id: string): Client | undefined {
    return clients.value.find(c => c.id === id)
  }

  function add(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const client: Client = { ...data, id: generateId(), createdAt: now, updatedAt: now }
    clients.value.push(client)
    saveToStorage(clients.value)
    return client
  }

  function update(id: string, data: Partial<Client>) {
    const idx = clients.value.findIndex(c => c.id === id)
    if (idx === -1) return
    clients.value[idx] = { ...clients.value[idx], ...data, updatedAt: new Date().toISOString() }
    saveToStorage(clients.value)
  }

  function remove(id: string) {
    clients.value = clients.value.filter(c => c.id !== id)
    saveToStorage(clients.value)
  }

  function search(query: string, type?: ClientType, status?: ClientStatus): Client[] {
    const q = query.toLowerCase()
    return clients.value.filter(c => {
      const matchesQuery = !q ||
        c.companyName.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q)
      const matchesType = !type || c.type === type
      const matchesStatus = !status || c.status === status
      return matchesQuery && matchesType && matchesStatus
    })
  }

  return { clients, activeClients, b2bClients, b2cClients, getById, add, update, remove, search }
})
