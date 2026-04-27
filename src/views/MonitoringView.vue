<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMonitoringStore } from '@/stores/monitoring'
import { useObjectsStore } from '@/stores/objects'
import type { MonitoringPoint, PointType, PointStatus } from '@/types'
import { POINT_TYPE_LABELS } from '@/types'
import PageHeader from '@/components/ui/PageHeader.vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import DataTable from '@/components/ui/DataTable.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import StatCard from '@/components/ui/StatCard.vue'
import PointFormModal from '@/components/monitoring/PointFormModal.vue'
import { batchGenerateQR, printQRBatch } from '@/utils/qr'

const router = useRouter()
const monitoringStore = useMonitoringStore()
const objectsStore = useObjectsStore()

const searchQuery = ref('')
const filterType = ref<PointType | ''>('')
const filterStatus = ref<PointStatus | ''>('')
const filterObject = ref('')
const showForm = ref(false)
const editingPoint = ref<MonitoringPoint | null>(null)

const columns = [
  { key: 'number', label: '№', width: '60px' },
  { key: 'tagId', label: 'QR Tag' },
  { key: 'type', label: 'Тип' },
  { key: 'objectName', label: "Об'єкт" },
  { key: 'zone', label: 'Зона' },
  { key: 'floor', label: 'Поверх', width: '80px' },
  { key: 'status', label: 'Статус', width: '120px' },
  { key: 'lastCheckedAt', label: 'Остання перевірка' }
]

const filteredPoints = computed(() => {
  return monitoringStore.searchPoints(
    searchQuery.value,
    filterObject.value || undefined,
    filterType.value || undefined,
    filterStatus.value || undefined
  ).map(p => ({
    ...p,
    objectName: objectsStore.getById(p.objectId)?.name ?? '—'
  }))
})

function openCreate() {
  editingPoint.value = null
  showForm.value = true
}

function onSave(data: Omit<MonitoringPoint, 'id'>) {
  if (editingPoint.value) {
    monitoringStore.updatePoint(editingPoint.value.id, data)
  } else {
    monitoringStore.addPoint(data)
  }
  showForm.value = false
}

function goToDetail(row: Record<string, unknown>) {
  router.push({ name: 'point-detail', params: { id: row.id as string } })
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('uk-UA')
}

async function batchPrintQR() {
  const tags = filteredPoints.value.map(p => ({
    tagId: p.tagId,
    label: `Точка №${p.number} — ${p.objectName}`
  }))
  if (tags.length === 0) return
  const items = await batchGenerateQR(tags)
  printQRBatch(items)
}
</script>

<template>
  <div>
    <PageHeader title="Моніторинг" subtitle="Моніторингові точки, QR-коди та карта об'єктів">
      <template #actions>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          @click="openCreate"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Додати точку
        </button>
        <button
          class="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          @click="batchPrintQR"
        >
          Друк QR
        </button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-4 gap-4 mb-6">
      <StatCard title="Всього точок" :value="monitoringStore.points.length" icon="📍" color="blue" />
      <StatCard title="Активних" :value="monitoringStore.activePoints.length" icon="🟢" color="green" />
      <StatCard title="Спрацювань" :value="monitoringStore.triggeredPoints.length" icon="🔴" color="red" />
      <StatCard title="Перевірок" :value="monitoringStore.checks.length" icon="📋" color="purple" />
    </div>

    <div class="flex items-center gap-4 mb-4">
      <div class="flex-1">
        <SearchBar v-model="searchQuery" placeholder="Пошук за QR, зоною, поверхом..." />
      </div>
      <select
        v-model="filterObject"
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Всі об'єкти</option>
        <option v-for="o in objectsStore.objects" :key="o.id" :value="o.id">
          {{ o.name }}
        </option>
      </select>
      <select
        v-model="filterType"
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Всі типи</option>
        <option value="trap">Пастка</option>
        <option value="bait_station">Приманкова станція</option>
        <option value="feeder">Годівниця</option>
        <option value="control_point">Контрольна точка</option>
      </select>
      <select
        v-model="filterStatus"
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Всі статуси</option>
        <option value="active">Активні</option>
        <option value="inactive">Неактивні</option>
        <option value="triggered">Спрацювали</option>
        <option value="maintenance">Обслуговування</option>
      </select>
    </div>

    <DataTable
      :columns="columns"
      :rows="(filteredPoints as unknown as Record<string, unknown>[])"
      empty-text="Моніторингових точок ще немає."
      @row-click="goToDetail"
    >
      <template #cell-tagId="{ value }">
        <span class="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{{ value }}</span>
      </template>
      <template #cell-type="{ value }">
        {{ POINT_TYPE_LABELS[value as PointType] || value }}
      </template>
      <template #cell-status="{ value }">
        <StatusBadge :status="String(value)" />
      </template>
      <template #cell-lastCheckedAt="{ value }">
        {{ formatDate(value as string | null) }}
      </template>
    </DataTable>

    <PointFormModal
      :show="showForm"
      :point="editingPoint"
      @close="showForm = false"
      @save="onSave"
    />
  </div>
</template>
