import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ServicePlan } from '@/types'

const STORAGE_KEY = 'pc_service_plans'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function load(): ServicePlan[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) as ServicePlan[] : []
}

function save(items: ServicePlan[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export const usePlansStore = defineStore('plans', () => {
  const plans = ref<ServicePlan[]>(load())

  const activePlans = computed(() => plans.value.filter(p => p.status === 'active'))

  function getById(id: string): ServicePlan | undefined {
    return plans.value.find(p => p.id === id)
  }

  function getByObjectId(objectId: string): ServicePlan[] {
    return plans.value.filter(p => p.objectId === objectId)
  }

  function getByClientId(clientId: string): ServicePlan[] {
    return plans.value.filter(p => p.clientId === clientId)
  }

  function add(data: Omit<ServicePlan, 'id' | 'createdAt'>): ServicePlan {
    const plan: ServicePlan = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    plans.value.push(plan)
    save(plans.value)
    return plan
  }

  function update(id: string, data: Partial<ServicePlan>) {
    const idx = plans.value.findIndex(p => p.id === id)
    if (idx === -1) return
    plans.value[idx] = { ...plans.value[idx], ...data }
    save(plans.value)
  }

  function remove(id: string) {
    plans.value = plans.value.filter(p => p.id !== id)
    save(plans.value)
  }

  return { plans, activePlans, getById, getByObjectId, getByClientId, add, update, remove }
})
