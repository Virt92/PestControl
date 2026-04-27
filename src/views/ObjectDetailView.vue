<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useObjectsStore } from '@/stores/objects'
import { useClientsStore } from '@/stores/clients'
import { useMonitoringStore } from '@/stores/monitoring'
import { useVisitsStore } from '@/stores/visits'
import type { SiteObject } from '@/types'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import DataTable from '@/components/ui/DataTable.vue'
import ObjectFormModal from '@/components/objects/ObjectFormModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { POINT_TYPE_LABELS } from '@/types'

const route = useRoute()
const router = useRouter()
const objectsStore = useObjectsStore()
const clientsStore = useClientsStore()
const monitoringStore = useMonitoringStore()
const visitsStore = useVisitsStore()

const objectId = computed(() => route.params.id as string)
const obj = computed(() => objectsStore.getById(objectId.value))
const client = computed(() => obj.value ? clientsStore.getById(obj.value.clientId) : undefined)
const points = computed(() => monitoringStore.getPointsByObjectId(objectId.value))
const visits = computed(() => visitsStore.getByObjectId(objectId.value))

const showEdit = ref(false)
const showDelete = ref(false)
const activeTab = ref<'points' | 'visits'>('points')

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
        <p class="text-2xl font-bold text-indigo-600">{{ visits.filter(v => v.status === 'planned').length }}</p>
        <p class="text-xs text-gray-500 mt-1">Запланов.</p>
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

    <div class="flex gap-4 mb-4 border-b border-gray-200">
      <button
        :class="[
          'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
          activeTab === 'points'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        ]"
        @click="activeTab = 'points'"
      >
        Моніторингові точки ({{ points.length }})
      </button>
      <button
        :class="[
          'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
          activeTab === 'visits'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        ]"
        @click="activeTab = 'visits'"
      >
        Виїзди ({{ visits.length }})
      </button>
    </div>

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
