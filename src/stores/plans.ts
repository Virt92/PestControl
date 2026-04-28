import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ServicePlan } from '@/types'
import { api } from '@/services/api'

export const usePlansStore = defineStore('plans', () => {
  const plans = ref<ServicePlan[]>([])
  const loading = ref(false)

  const activePlans = computed(() => plans.value.filter(p => p.status === 'active'))

  async function fetchAll() {
    loading.value = true
    try {
      plans.value = await api.get<ServicePlan[]>('/plans')
    } finally {
      loading.value = false
    }
  }

  function getById(id: string): ServicePlan | undefined {
    return plans.value.find(p => p.id === id)
  }

  function getByObjectId(objectId: string): ServicePlan[] {
    return plans.value.filter(p => p.objectId === objectId)
  }

  function getByClientId(clientId: string): ServicePlan[] {
    return plans.value.filter(p => p.clientId === clientId)
  }

  async function add(data: Omit<ServicePlan, 'id' | 'createdAt'>): Promise<ServicePlan> {
    const plan = await api.post<ServicePlan>('/plans', data)
    plans.value.unshift(plan)
    return plan
  }

  async function update(id: string, data: Partial<ServicePlan>) {
    const updated = await api.put<ServicePlan>(`/plans/${id}`, data)
    const idx = plans.value.findIndex(p => p.id === id)
    if (idx !== -1) plans.value[idx] = updated
    return updated
  }

  async function remove(id: string) {
    await api.delete(`/plans/${id}`)
    plans.value = plans.value.filter(p => p.id !== id)
  }

  return { plans, loading, activePlans, getById, getByObjectId, getByClientId, fetchAll, add, update, remove }
})
