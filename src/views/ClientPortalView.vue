<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClientsStore } from '@/stores/clients'
import { useObjectsStore } from '@/stores/objects'
import { useVisitsStore } from '@/stores/visits'
import { useMonitoringStore } from '@/stores/monitoring'
import { useDocumentsStore } from '@/stores/documents'
import { VISIT_TYPE_LABELS, DOCUMENT_TYPE_LABELS, DOCUMENT_STATUS_LABELS } from '@/types'
import type { VisitType, DocumentType, DocumentStatus } from '@/types'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import DataTable from '@/components/ui/DataTable.vue'

const clientsStore = useClientsStore()
const objectsStore = useObjectsStore()
const visitsStore = useVisitsStore()
const monitoringStore = useMonitoringStore()
const documentsStore = useDocumentsStore()

const selectedClientId = ref('')
const activeTab = ref<'overview' | 'visits' | 'monitoring' | 'documents'>('overview')

const clients = computed(() => clientsStore.clients)

const selectedClient = computed(() =>
  selectedClientId.value ? clientsStore.getById(selectedClientId.value) : null
)

const clientObjects = computed(() =>
  selectedClientId.value ? objectsStore.objects.filter(o => o.clientId === selectedClientId.value) : []
)

const clientVisits = computed(() =>
  selectedClientId.value
    ? visitsStore.visits
        .filter(v => v.clientId === selectedClientId.value && v.status === 'completed')
        .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    : []
)

const clientDocuments = computed(() =>
  selectedClientId.value
    ? documentsStore.documents.filter(d => d.clientId === selectedClientId.value && d.status === 'published')
    : []
)

const clientPoints = computed(() => {
  const objectIds = clientObjects.value.map(o => o.id)
  return monitoringStore.points.filter(p => objectIds.includes(p.objectId))
})

const visitColumns = [
  { key: 'scheduledAt', label: 'Дата' },
  { key: 'type', label: 'Тип' },
  { key: 'objectName', label: "Об'єкт" },
  { key: 'pointsChecked', label: 'Перевірено точок' },
  { key: 'status', label: 'Статус', width: '120px' }
]

const docColumns = [
  { key: 'title', label: 'Документ' },
  { key: 'type', label: 'Тип' },
  { key: 'publishedAt', label: 'Опубліковано' },
  { key: 'status', label: 'Статус', width: '120px' }
]

const visitRows = computed(() =>
  clientVisits.value.map(v => ({
    ...v,
    objectName: objectsStore.getById(v.objectId)?.name ?? '—'
  }))
)

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('uk-UA')
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Клієнтський кабінет</h1>
      <p class="text-sm text-gray-500 mt-1">Портал для клієнтів: документи, виїзди, моніторинг</p>
    </div>

    <div class="mb-6">
      <select
        v-model="selectedClientId"
        class="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-80"
      >
        <option value="">Оберіть клієнта</option>
        <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.companyName }}</option>
      </select>
    </div>

    <div v-if="selectedClient">
      <!-- Client Info -->
      <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">{{ selectedClient.companyName }}</h2>
            <p class="text-sm text-gray-500">{{ selectedClient.contactPerson }} · {{ selectedClient.phone }}</p>
          </div>
          <StatusBadge :status="selectedClient.status" />
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p class="text-2xl font-bold text-blue-600">{{ clientObjects.length }}</p>
          <p class="text-xs text-gray-500 mt-1">Об'єктів</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p class="text-2xl font-bold text-green-600">{{ clientVisits.length }}</p>
          <p class="text-xs text-gray-500 mt-1">Виїздів</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p class="text-2xl font-bold text-purple-600">{{ clientPoints.length }}</p>
          <p class="text-xs text-gray-500 mt-1">Точок моніт.</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p class="text-2xl font-bold text-indigo-600">{{ clientDocuments.length }}</p>
          <p class="text-xs text-gray-500 mt-1">Документів</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-4 mb-4 border-b border-gray-200">
        <button
          v-for="tab in [
            { key: 'overview', label: 'Огляд' },
            { key: 'visits', label: 'Виїзди' },
            { key: 'monitoring', label: 'Моніторинг' },
            { key: 'documents', label: 'Документи' }
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

      <!-- Overview -->
      <div v-if="activeTab === 'overview'">
        <div class="grid grid-cols-2 gap-6">
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <h3 class="text-sm font-semibold text-gray-500 uppercase mb-4">Об'єкти</h3>
            <div v-for="o in clientObjects" :key="o.id" class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ o.name }}</p>
                <p class="text-xs text-gray-500">{{ o.address }}</p>
              </div>
              <StatusBadge :status="o.status" />
            </div>
            <p v-if="clientObjects.length === 0" class="text-sm text-gray-400 text-center py-4">Об'єктів немає</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <h3 class="text-sm font-semibold text-gray-500 uppercase mb-4">Останні документи</h3>
            <div v-for="d in clientDocuments.slice(0, 5)" :key="d.id" class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ d.title }}</p>
                <p class="text-xs text-gray-500">{{ DOCUMENT_TYPE_LABELS[d.type as DocumentType] }} · {{ formatDate(d.publishedAt) }}</p>
              </div>
              <StatusBadge :status="d.status" />
            </div>
            <p v-if="clientDocuments.length === 0" class="text-sm text-gray-400 text-center py-4">Документів немає</p>
          </div>
        </div>
      </div>

      <!-- Visits -->
      <div v-if="activeTab === 'visits'">
        <DataTable
          :columns="visitColumns"
          :rows="(visitRows as unknown as Record<string, unknown>[])"
          empty-text="Завершених виїздів немає."
        >
          <template #cell-scheduledAt="{ value }">{{ formatDate(value as string) }}</template>
          <template #cell-type="{ value }">{{ VISIT_TYPE_LABELS[value as VisitType] }}</template>
          <template #cell-status="{ value }"><StatusBadge :status="String(value)" /></template>
        </DataTable>
      </div>

      <!-- Monitoring -->
      <div v-if="activeTab === 'monitoring'">
        <div class="grid grid-cols-3 gap-4">
          <div
            v-for="o in clientObjects"
            :key="o.id"
            class="bg-white rounded-xl border border-gray-200 p-4"
          >
            <h4 class="text-sm font-semibold text-gray-900 mb-2">{{ o.name }}</h4>
            <div class="space-y-1">
              <div v-for="p in monitoringStore.getPointsByObjectId(o.id)" :key="p.id" class="flex items-center justify-between text-xs">
                <span>Точка №{{ p.number }} ({{ p.zone }})</span>
                <StatusBadge :status="p.status" />
              </div>
            </div>
            <p v-if="monitoringStore.getPointsByObjectId(o.id).length === 0" class="text-xs text-gray-400 mt-2">Точок немає</p>
          </div>
        </div>
        <p v-if="clientObjects.length === 0" class="text-sm text-gray-400 text-center py-8">Об'єктів немає</p>
      </div>

      <!-- Documents -->
      <div v-if="activeTab === 'documents'">
        <DataTable
          :columns="docColumns"
          :rows="(clientDocuments as unknown as Record<string, unknown>[])"
          empty-text="Опублікованих документів немає."
        >
          <template #cell-type="{ value }">{{ DOCUMENT_TYPE_LABELS[value as DocumentType] }}</template>
          <template #cell-publishedAt="{ value }">{{ formatDate(value as string | null) }}</template>
          <template #cell-status="{ value }">
            {{ DOCUMENT_STATUS_LABELS[value as DocumentStatus] }}
          </template>
        </DataTable>
      </div>
    </div>

    <div v-else class="text-center py-16">
      <svg class="mx-auto w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <p class="text-gray-500">Оберіть клієнта для перегляду кабінету</p>
    </div>
  </div>
</template>
