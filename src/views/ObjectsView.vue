<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useObjectsStore } from '@/stores/objects'
import { useClientsStore } from '@/stores/clients'
import { useMonitoringStore } from '@/stores/monitoring'
import type { SiteObject, ObjectStatus } from '@/types'
import PageHeader from '@/components/ui/PageHeader.vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import DataTable from '@/components/ui/DataTable.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import ObjectFormModal from '@/components/objects/ObjectFormModal.vue'

const router = useRouter()
const objectsStore = useObjectsStore()
const clientsStore = useClientsStore()
const monitoringStore = useMonitoringStore()

const searchQuery = ref('')
const filterStatus = ref<ObjectStatus | ''>('')
const filterClient = ref('')
const showForm = ref(false)
const editingObject = ref<SiteObject | null>(null)

const columns = [
  { key: 'name', label: 'Назва' },
  { key: 'clientName', label: 'Клієнт' },
  { key: 'address', label: 'Адреса' },
  { key: 'type', label: 'Тип', width: '120px' },
  { key: 'pointsCount', label: 'Точок', width: '80px' },
  { key: 'status', label: 'Статус', width: '120px' }
]

const objectTypeLabels: Record<string, string> = {
  factory: 'Завод',
  warehouse: 'Склад',
  office: 'Офіс',
  restaurant: 'Ресторан',
  shop: 'Магазин',
  apartment: 'Квартира',
  house: 'Будинок',
  other: 'Інше'
}

const filteredObjects = computed(() => {
  return objectsStore.search(
    searchQuery.value,
    filterClient.value || undefined,
    filterStatus.value || undefined
  ).map(o => ({
    ...o,
    clientName: clientsStore.getById(o.clientId)?.companyName ?? '—',
    pointsCount: monitoringStore.getPointsByObjectId(o.id).length,
    typeLabel: objectTypeLabels[o.type] || o.type
  }))
})

function openCreate() {
  editingObject.value = null
  showForm.value = true
}

function onSave(data: Omit<SiteObject, 'id' | 'createdAt' | 'updatedAt'>) {
  if (editingObject.value) {
    objectsStore.update(editingObject.value.id, data)
  } else {
    objectsStore.add(data)
  }
  showForm.value = false
}

function goToDetail(row: Record<string, unknown>) {
  router.push({ name: 'object-detail', params: { id: row.id as string } })
}
</script>

<template>
  <div>
    <PageHeader title="Об'єкти" subtitle="Об'єкти обслуговування клієнтів">
      <template #actions>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          @click="openCreate"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Додати об'єкт
        </button>
      </template>
    </PageHeader>

    <div class="flex items-center gap-4 mb-4">
      <div class="flex-1">
        <SearchBar v-model="searchQuery" placeholder="Пошук за назвою, адресою..." />
      </div>
      <select
        v-model="filterClient"
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Всі клієнти</option>
        <option v-for="c in clientsStore.clients" :key="c.id" :value="c.id">
          {{ c.companyName }}
        </option>
      </select>
      <select
        v-model="filterStatus"
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Всі статуси</option>
        <option value="active">Активні</option>
        <option value="inactive">Неактивні</option>
        <option value="suspended">Призупинені</option>
      </select>
    </div>

    <DataTable
      :columns="columns"
      :rows="(filteredObjects as unknown as Record<string, unknown>[])"
      empty-text="Об'єктів ще немає. Спочатку додайте клієнта."
      @row-click="goToDetail"
    >
      <template #cell-name="{ row }">
        <span class="font-medium text-gray-900">{{ row.name }}</span>
      </template>
      <template #cell-type="{ row }">
        {{ (row as Record<string, unknown>).typeLabel ?? row.type }}
      </template>
      <template #cell-status="{ value }">
        <StatusBadge :status="String(value)" />
      </template>
    </DataTable>

    <ObjectFormModal
      :show="showForm"
      :object="editingObject"
      @close="showForm = false"
      @save="onSave"
    />
  </div>
</template>
