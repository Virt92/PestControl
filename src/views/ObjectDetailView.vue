<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useObjectsStore } from '@/stores/objects'
import { useClientsStore } from '@/stores/clients'
import { useMonitoringStore } from '@/stores/monitoring'
import { useVisitsStore } from '@/stores/visits'
import { usePlansStore } from '@/stores/plans'
import type { SiteObject, MonitoringPoint } from '@/types'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import DataTable from '@/components/ui/DataTable.vue'
import ObjectFormModal from '@/components/objects/ObjectFormModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import ObjectMap from '@/components/map/ObjectMap.vue'
import FloorPlanUpload from '@/components/map/FloorPlanUpload.vue'
import ActivityChart from '@/components/charts/ActivityChart.vue'
import ConsumptionChart from '@/components/charts/ConsumptionChart.vue'
import { POINT_TYPE_LABELS } from '@/types'
import { generateMonitoringJournal, generateRodenticideTable } from '@/utils/pdf'
import { batchGenerateQR, printQRBatch } from '@/utils/qr'

const route = useRoute()
const router = useRouter()
const objectsStore = useObjectsStore()
const clientsStore = useClientsStore()
const monitoringStore = useMonitoringStore()
const visitsStore = useVisitsStore()
const plansStore = usePlansStore()

const objectId = computed(() => route.params.id as string)
const obj = computed(() => objectsStore.getById(objectId.value))
const client = computed(() => obj.value ? clientsStore.getById(obj.value.clientId) : undefined)
const points = computed(() => monitoringStore.getPointsByObjectId(objectId.value))
const visits = computed(() => visitsStore.getByObjectId(objectId.value))
const plans = computed(() => plansStore.getByObjectId(objectId.value))
const allChecks = computed(() => {
  const pointIds = points.value.map(p => p.id)
  return monitoringStore.checks.filter(c => pointIds.includes(c.pointId))
})

const heatmapData = computed(() => {
  const data: Record<string, number> = {}
  for (const p of points.value) {
    const pointChecks = monitoringStore.getChecksByPointId(p.id)
    if (pointChecks.length === 0) { data[p.id] = 0; continue }
    const activeCount = pointChecks.filter(c => c.activity).length
    data[p.id] = Math.round((activeCount / pointChecks.length) * 100)
  }
  return data
})

const showEdit = ref(false)
const showDelete = ref(false)
const showHeatmap = ref(false)
const activeTab = ref<'points' | 'visits' | 'map' | 'charts' | 'plans'>('points')

const pointColumns = [
  { key: 'number', label: '№', width: '60px' },
  { key: 'type', label: 'Тип' },
  { key: 'zone', label: 'Зона' },
  { key: 'floor', label: 'Поверх', width: '80px' },
  { key: 'status', label: 'Статус', width: '120px' },
  { key: 'lastCheckedAt', label: 'Остання перевірка' }
]

const visitColumns = [
  { key: 'scheduledAt', label: 'Дата' },
  { key: 'type', label: 'Тип' },
  { key: 'assignedTo', label: 'Виконавець' },
  { key: 'status', label: 'Статус', width: '120px' }
]

function onSave(data: Omit<SiteObject, 'id' | 'createdAt' | 'updatedAt'>) {
  objectsStore.update(objectId.value, data)
  showEdit.value = false
}

function onDelete() {
  objectsStore.remove(objectId.value)
  router.push({ name: 'objects' })
}

function onFloorPlanUpload(dataUrl: string) {
  objectsStore.update(objectId.value, { floorPlanUrl: dataUrl })
}

function onPointMove(pointId: string, x: number, y: number) {
  monitoringStore.updatePoint(pointId, { positionX: x, positionY: y })
}

function onPointClick(point: MonitoringPoint) {
  router.push({ name: 'point-detail', params: { id: point.id } })
}

async function printAllQR() {
  const tags = points.value.map(p => ({
    tagId: p.tagId,
    label: `Точка №${p.number} — ${obj.value?.name ?? ''}`
  }))
  const items = await batchGenerateQR(tags)
  printQRBatch(items)
}

function downloadJournalPDF() {
  if (!obj.value || !client.value) return
  generateMonitoringJournal(obj.value, client.value, points.value, allChecks.value)
}

function downloadRodenticidePDF() {
  if (!obj.value || !client.value) return
  generateRodenticideTable(obj.value, client.value, points.value, allChecks.value)
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('uk-UA')
}
</script>

<template>
  <div v-if="obj">
    <div class="mb-4">
      <button
        class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        @click="router.push({ name: 'objects' })"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Назад до об'єктів
      </button>
    </div>

    <PageHeader :title="obj.name" :subtitle="obj.address">
      <template #actions>
        <button
          class="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          @click="printAllQR"
        >
          Друк QR
        </button>
        <button
          class="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          @click="downloadJournalPDF"
        >
          Журнал PDF
        </button>
        <button
          class="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          @click="downloadRodenticidePDF"
        >
          Витрата PDF
        </button>
        <button
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          @click="showEdit = true"
        >
          Редагувати
        </button>
        <button
          class="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
          @click="showDelete = true"
        >
          Видалити
        </button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
        <p class="text-2xl font-bold text-blue-600">{{ points.length }}</p>
        <p class="text-xs text-gray-500 mt-1">Точок</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
        <p class="text-2xl font-bold text-red-600">{{ points.filter(p => p.status === 'triggered').length }}</p>
        <p class="text-xs text-gray-500 mt-1">Спрацювань</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
        <p class="text-2xl font-bold text-green-600">{{ visits.filter(v => v.status === 'completed').length }}</p>
        <p class="text-xs text-gray-500 mt-1">Виїздів</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
        <p class="text-2xl font-bold text-indigo-600">{{ plans.length }}</p>
        <p class="text-xs text-gray-500 mt-1">Планів</p>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-6 mb-6">
      <div class="bg-white rounded-xl border border-gray-200 p-5 col-span-2">
        <h3 class="text-sm font-semibold text-gray-500 uppercase mb-4">Інформація</h3>
        <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt class="text-gray-500">Клієнт</dt>
            <dd class="mt-1">
              <button
                class="text-blue-600 hover:text-blue-800"
                @click="router.push({ name: 'client-detail', params: { id: obj.clientId } })"
              >
                {{ client?.companyName ?? '—' }}
              </button>
            </dd>
          </div>
          <div>
            <dt class="text-gray-500">Статус</dt>
            <dd class="mt-1"><StatusBadge :status="obj.status" /></dd>
          </div>
          <div>
            <dt class="text-gray-500">Тип</dt>
            <dd class="mt-1 text-gray-900">{{ obj.type || '—' }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Поверхів</dt>
            <dd class="mt-1 text-gray-900">{{ obj.floors }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Контакт на об'єкті</dt>
            <dd class="mt-1 text-gray-900">{{ obj.contactOnSite || '—' }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Телефон контакту</dt>
            <dd class="mt-1 text-gray-900">{{ obj.contactPhone || '—' }}</dd>
          </div>
        </dl>
        <div v-if="obj.accessNotes" class="mt-4 pt-4 border-t border-gray-100">
          <dt class="text-sm text-gray-500">Умови доступу</dt>
          <dd class="mt-1 text-sm text-gray-700">{{ obj.accessNotes }}</dd>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-4 mb-4 border-b border-gray-200">
      <button
        v-for="tab in [
          { key: 'points', label: `Точки (${points.length})` },
          { key: 'visits', label: `Виїзди (${visits.length})` },
          { key: 'map', label: 'Карта' },
          { key: 'charts', label: 'Аналітика' },
          { key: 'plans', label: `Плани (${plans.length})` }
        ]"
        :key="tab.key"
        :class="[
          'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
          activeTab === tab.key
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        ]"
        @click="activeTab = tab.key as typeof activeTab"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Points Tab -->
    <div v-if="activeTab === 'points'">
      <DataTable
        :columns="pointColumns"
        :rows="(points as unknown as Record<string, unknown>[])"
        empty-text="Точок моніторингу ще немає."
        @row-click="(row) => router.push({ name: 'point-detail', params: { id: row.id as string } })"
      >
        <template #cell-type="{ value }">
          {{ POINT_TYPE_LABELS[value as keyof typeof POINT_TYPE_LABELS] || value }}
        </template>
        <template #cell-status="{ value }">
          <StatusBadge :status="String(value)" />
        </template>
        <template #cell-lastCheckedAt="{ value }">
          {{ formatDate(value as string | null) }}
        </template>
      </DataTable>
    </div>

    <!-- Visits Tab -->
    <div v-if="activeTab === 'visits'">
      <DataTable
        :columns="visitColumns"
        :rows="(visits as unknown as Record<string, unknown>[])"
        empty-text="Виїздів ще не було."
        @row-click="(row) => router.push({ name: 'visit-detail', params: { id: row.id as string } })"
      >
        <template #cell-scheduledAt="{ value }">
          {{ formatDate(value as string) }}
        </template>
        <template #cell-status="{ value }">
          <StatusBadge :status="String(value)" />
        </template>
      </DataTable>
    </div>

    <!-- Map Tab -->
    <div v-if="activeTab === 'map'">
      <div v-if="!obj.floorPlanUrl" class="mb-4">
        <FloorPlanUpload @upload="onFloorPlanUpload" />
      </div>
      <div v-else>
        <div class="flex items-center gap-3 mb-4">
          <label class="flex items-center gap-2 text-sm">
            <input v-model="showHeatmap" type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            Теплова карта
          </label>
          <FloorPlanUpload @upload="onFloorPlanUpload" />
        </div>
        <ObjectMap
          :floor-plan-url="obj.floorPlanUrl"
          :points="points"
          :editable="true"
          :show-heatmap="showHeatmap"
          :heatmap-data="heatmapData"
          @point-click="onPointClick"
          @point-move="onPointMove"
        />
        <p class="text-xs text-gray-400 mt-2">Натисніть на карту для розміщення точок або перетягніть існуючі</p>
      </div>
    </div>

    <!-- Charts Tab -->
    <div v-if="activeTab === 'charts'">
      <div v-if="allChecks.length === 0" class="text-center py-12 text-gray-400">
        <p>Перевірок ще немає — графіки з'являться після додавання даних</p>
      </div>
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityChart :checks="allChecks" title="Динаміка активності шкідників" />
        <ConsumptionChart :checks="allChecks" :points="points" title="Витрата приманки по точках" />
      </div>
    </div>

    <!-- Plans Tab -->
    <div v-if="activeTab === 'plans'">
      <div v-if="plans.length === 0" class="text-center py-12 text-gray-400">
        <p>Планів обслуговування немає</p>
      </div>
      <div v-else class="space-y-3">
        <div v-for="plan in plans" :key="plan.id" class="bg-white rounded-xl border border-gray-200 p-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-semibold text-gray-900">{{ plan.title }}</h4>
              <p class="text-xs text-gray-500 mt-1">
                {{ plan.frequency }} · З {{ formatDate(plan.startDate) }}
                <span v-if="plan.endDate"> до {{ formatDate(plan.endDate) }}</span>
              </p>
              <div class="flex flex-wrap gap-1 mt-2">
                <span v-for="pt in plan.pestTypes" :key="pt" class="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{{ pt }}</span>
                <span v-for="z in plan.zones" :key="z" class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{{ z }}</span>
              </div>
            </div>
            <StatusBadge :status="plan.status" />
          </div>
        </div>
      </div>
    </div>

    <ObjectFormModal
      :show="showEdit"
      :object="obj"
      @close="showEdit = false"
      @save="onSave"
    />

    <ConfirmDialog
      :show="showDelete"
      title="Видалити об'єкт"
      :message="`Ви впевнені, що хочете видалити об'єкт «${obj.name}»?`"
      confirm-label="Видалити"
      confirm-variant="danger"
      @confirm="onDelete"
      @cancel="showDelete = false"
    />
  </div>

  <div v-else class="text-center py-12">
    <p class="text-gray-500">Об'єкт не знайдено</p>
  </div>
</template>
