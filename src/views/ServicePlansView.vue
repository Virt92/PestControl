<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlansStore } from '@/stores/plans'
import { useClientsStore } from '@/stores/clients'
import { useObjectsStore } from '@/stores/objects'
import type { ServicePlan } from '@/types'
import PageHeader from '@/components/ui/PageHeader.vue'
import DataTable from '@/components/ui/DataTable.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import ServicePlanFormModal from '@/components/plans/ServicePlanFormModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

const plansStore = usePlansStore()
const clientsStore = useClientsStore()
const objectsStore = useObjectsStore()

const showForm = ref(false)
const editingPlan = ref<ServicePlan | null>(null)
const deletingPlan = ref<ServicePlan | null>(null)
const filterStatus = ref<'' | 'active' | 'paused' | 'completed'>('')

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: 'Щотижня',
  biweekly: 'Раз на 2 тижні',
  monthly: 'Щомісяця',
  quarterly: 'Щоквартально',
  custom: 'Інше'
}

const columns = [
  { key: 'title', label: 'Назва' },
  { key: 'clientName', label: 'Клієнт' },
  { key: 'objectName', label: "Об'єкт" },
  { key: 'frequency', label: 'Частота' },
  { key: 'pestTypes', label: 'Шкідники' },
  { key: 'status', label: 'Статус', width: '120px' },
  { key: 'actions', label: '', width: '100px' }
]

const filteredPlans = computed(() => {
  const list = filterStatus.value
    ? plansStore.plans.filter(p => p.status === filterStatus.value)
    : plansStore.plans
  return list.map(p => ({
    ...p,
    clientName: clientsStore.getById(p.clientId)?.companyName ?? '—',
    objectName: objectsStore.getById(p.objectId)?.name ?? '—'
  }))
})

function openCreate() {
  editingPlan.value = null
  showForm.value = true
}

function openEdit(plan: ServicePlan) {
  editingPlan.value = plan
  showForm.value = true
}

function onSave(data: Omit<ServicePlan, 'id' | 'createdAt'>) {
  if (editingPlan.value) {
    plansStore.update(editingPlan.value.id, data)
  } else {
    plansStore.add(data)
  }
  showForm.value = false
}

function confirmDelete(plan: ServicePlan) {
  deletingPlan.value = plan
}

function onDelete() {
  if (deletingPlan.value) plansStore.remove(deletingPlan.value.id)
  deletingPlan.value = null
}
</script>

<template>
  <div>
    <PageHeader title="Плани обслуговування" subtitle="Регулярні графіки обробок та перевірок">
      <template #actions>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          @click="openCreate"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Створити план
        </button>
      </template>
    </PageHeader>

    <div class="flex items-center gap-4 mb-4">
      <select
        v-model="filterStatus"
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Всі статуси</option>
        <option value="active">Активні</option>
        <option value="paused">Призупинені</option>
        <option value="completed">Завершені</option>
      </select>
    </div>

    <DataTable
      :columns="columns"
      :rows="(filteredPlans as unknown as Record<string, unknown>[])"
      empty-text="Планів обслуговування ще немає."
    >
      <template #cell-frequency="{ value }">
        {{ FREQUENCY_LABELS[value as string] || value }}
      </template>
      <template #cell-pestTypes="{ value }">
        <div class="flex flex-wrap gap-1">
          <span
            v-for="pt in (value as string[])"
            :key="pt"
            class="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full"
          >{{ pt }}</span>
        </div>
      </template>
      <template #cell-status="{ value }">
        <StatusBadge :status="String(value)" />
      </template>
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <button class="text-xs text-blue-600 hover:text-blue-800" @click.stop="openEdit(row as unknown as ServicePlan)">Ред.</button>
          <button class="text-xs text-red-600 hover:text-red-800" @click.stop="confirmDelete(row as unknown as ServicePlan)">Вид.</button>
        </div>
      </template>
    </DataTable>

    <ServicePlanFormModal
      :show="showForm"
      :plan="editingPlan"
      @close="showForm = false"
      @save="onSave"
    />

    <ConfirmDialog
      :show="!!deletingPlan"
      title="Видалити план"
      :message="`Видалити план «${deletingPlan?.title}»?`"
      confirm-label="Видалити"
      confirm-variant="danger"
      @confirm="onDelete"
      @cancel="deletingPlan = null"
    />
  </div>
</template>
