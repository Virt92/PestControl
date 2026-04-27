<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVisitsStore } from '@/stores/visits'
import { useObjectsStore } from '@/stores/objects'
import { useClientsStore } from '@/stores/clients'
import { useMonitoringStore } from '@/stores/monitoring'
import type { Visit } from '@/types'
import { VISIT_TYPE_LABELS } from '@/types'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import DataTable from '@/components/ui/DataTable.vue'
import VisitFormModal from '@/components/visits/VisitFormModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { generateVisitAct } from '@/utils/pdf'

const route = useRoute()
const router = useRouter()
const visitsStore = useVisitsStore()
const objectsStore = useObjectsStore()
const clientsStore = useClientsStore()
const monitoringStore = useMonitoringStore()

const visitId = computed(() => route.params.id as string)
const visit = computed(() => visitsStore.getById(visitId.value))
const obj = computed(() => visit.value ? objectsStore.getById(visit.value.objectId) : undefined)
const client = computed(() => visit.value ? clientsStore.getById(visit.value.clientId) : undefined)
const checks = computed(() => monitoringStore.getChecksByVisitId(visitId.value))

const showEdit = ref(false)
const showDelete = ref(false)

const checkColumns = [
  { key: 'pointNumber', label: 'Точка №' },
  { key: 'activity', label: 'Активність' },
  { key: 'activityLevel', label: 'Рівень' },
  { key: 'consumptionPercent', label: '% поїдання' },
  { key: 'equipmentStatus', label: 'Стан обладнання' },
  { key: 'correctiveAction', label: 'Корект. дія' }
]

const checksWithPointInfo = computed(() => {
  return checks.value.map(c => {
    const point = monitoringStore.getPointById(c.pointId)
    return {
      ...c,
      pointNumber: point?.number ?? '—'
    }
  })
})

function onSave(data: Omit<Visit, 'id' | 'createdAt'>) {
  visitsStore.update(visitId.value, data)
  showEdit.value = false
}

function onDelete() {
  visitsStore.remove(visitId.value)
  router.push({ name: 'visits' })
}

function startVisit() {
  visitsStore.update(visitId.value, { status: 'in_progress' })
}

function completeVisit() {
  visitsStore.update(visitId.value, {
    status: 'completed',
    completedAt: new Date().toISOString(),
    pointsChecked: checks.value.length
  })
}

function downloadAct() {
  if (!visit.value || !obj.value || !client.value) return
  const allPoints = monitoringStore.getPointsByObjectId(visit.value.objectId)
  generateVisitAct(visit.value, obj.value, client.value, checks.value, allPoints)
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div v-if="visit">
    <div class="mb-4">
      <button
        class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        @click="router.push({ name: 'visits' })"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Назад до виїздів
      </button>
    </div>

    <PageHeader
      :title="VISIT_TYPE_LABELS[visit.type]"
      :subtitle="`${obj?.name ?? '—'} — ${formatDate(visit.scheduledAt)}`"
    >
      <template #actions>
        <button
          v-if="visit.status === 'planned'"
          class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          @click="startVisit"
        >
          Розпочати
        </button>
        <button
          v-if="visit.status === 'in_progress'"
          class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
          @click="completeVisit"
        >
          Завершити
        </button>
        <button
          class="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          @click="downloadAct"
        >
          Акт PDF
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

    <div class="grid grid-cols-3 gap-6 mb-6">
      <div class="bg-white rounded-xl border border-gray-200 p-5 col-span-2">
        <h3 class="text-sm font-semibold text-gray-500 uppercase mb-4">Деталі виїзду</h3>
        <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt class="text-gray-500">Статус</dt>
            <dd class="mt-1"><StatusBadge :status="visit.status" /></dd>
          </div>
          <div>
            <dt class="text-gray-500">Тип</dt>
            <dd class="mt-1 text-gray-900">{{ VISIT_TYPE_LABELS[visit.type] }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Об'єкт</dt>
            <dd class="mt-1">
              <button
                class="text-blue-600 hover:text-blue-800"
                @click="router.push({ name: 'object-detail', params: { id: visit.objectId } })"
              >
                {{ obj?.name ?? '—' }}
              </button>
            </dd>
          </div>
          <div>
            <dt class="text-gray-500">Клієнт</dt>
            <dd class="mt-1">
              <button
                class="text-blue-600 hover:text-blue-800"
                @click="router.push({ name: 'client-detail', params: { id: visit.clientId } })"
              >
                {{ client?.companyName ?? '—' }}
              </button>
            </dd>
          </div>
          <div>
            <dt class="text-gray-500">Виконавець</dt>
            <dd class="mt-1 text-gray-900">{{ visit.assignedTo || '—' }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Заплановано</dt>
            <dd class="mt-1 text-gray-900">{{ formatDate(visit.scheduledAt) }}</dd>
          </div>
          <div v-if="visit.completedAt">
            <dt class="text-gray-500">Завершено</dt>
            <dd class="mt-1 text-gray-900">{{ formatDate(visit.completedAt) }}</dd>
          </div>
        </dl>
        <div v-if="visit.notes" class="mt-4 pt-4 border-t border-gray-100">
          <dt class="text-sm text-gray-500">Нотатки</dt>
          <dd class="mt-1 text-sm text-gray-700">{{ visit.notes }}</dd>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p class="text-3xl font-bold text-blue-600">{{ checks.length }}</p>
          <p class="text-sm text-gray-500 mt-1">Перевірок</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p class="text-3xl font-bold text-red-600">{{ checks.filter(c => c.activity).length }}</p>
          <p class="text-sm text-gray-500 mt-1">З активністю</p>
        </div>
      </div>
    </div>

    <h2 class="text-lg font-semibold text-gray-900 mb-4">Результати перевірок</h2>
    <DataTable
      :columns="checkColumns"
      :rows="(checksWithPointInfo as unknown as Record<string, unknown>[])"
      empty-text="Перевірок для цього виїзду ще немає."
    >
      <template #cell-activity="{ value }">
        <span :class="value ? 'text-red-600 font-medium' : 'text-green-600'">
          {{ value ? 'Так' : 'Ні' }}
        </span>
      </template>
      <template #cell-consumptionPercent="{ value }">
        {{ value != null ? `${value}%` : '—' }}
      </template>
    </DataTable>

    <VisitFormModal
      :show="showEdit"
      :visit="visit"
      @close="showEdit = false"
      @save="onSave"
    />

    <ConfirmDialog
      :show="showDelete"
      title="Видалити виїзд"
      message="Ви впевнені, що хочете видалити цей виїзд?"
      confirm-label="Видалити"
      confirm-variant="danger"
      @confirm="onDelete"
      @cancel="showDelete = false"
    />
  </div>

  <div v-else class="text-center py-12">
    <p class="text-gray-500">Виїзд не знайдено</p>
  </div>
</template>
