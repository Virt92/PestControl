import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Client, ClientType, ClientStatus } from '@/types'
import { api } from '@/services/api'

export const useClientsStore = defineStore('clients', () => {
  const clients = ref<Client[]>([])
  const loading = ref(false)

  const activeClients = computed(() => clients.value.filter(c => c.status === 'active'))
  const b2bClients = computed(() => clients.value.filter(c => c.type === 'b2b'))
  const b2cClients = computed(() => clients.value.filter(c => c.type === 'b2c'))

  async function fetchAll() {
    loading.value = true
    try {
      clients.value = await api.get<Client[]>('/clients')
    } finally {
      loading.value = false
    }
  }

  function getById(id: string): Client | undefined {
    return clients.value.find(c => c.id === id)
  }

  async function add(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) {
    const client = await api.post<Client>('/clients', data)
    clients.value.unshift(client)
    return client
  }

  async function update(id: string, data: Partial<Client>) {
    const updated = await api.put<Client>(`/clients/${id}`, data)
    const idx = clients.value.findIndex(c => c.id === id)
    if (idx !== -1) clients.value[idx] = updated
    return updated
  }

  async function remove(id: string) {
    await api.delete(`/clients/${id}`)
    clients.value = clients.value.filter(c => c.id !== id)
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

  return { clients, loading, activeClients, b2bClients, b2cClients, getById, fetchAll, add, update, remove, search }
})
