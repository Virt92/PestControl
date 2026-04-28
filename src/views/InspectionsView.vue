<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useInspectionsStore } from '@/stores/inspections'
import { useClientsStore } from '@/stores/clients'
import { useObjectsStore } from '@/stores/objects'
import type { Inspection, InspectionType, InspectionStatus } from '@/types'
import { INSPECTION_TYPE_LABELS, INSPECTION_STATUS_LABELS } from '@/types'
import PageHeader from '@/components/ui/PageHeader.vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import DataTable from '@/components/ui/DataTable.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import FormField from '@/components/ui/FormField.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

const inspStore = useInspectionsStore()
const clientsStore = useClientsStore()
const objectsStore = useObjectsStore()

const searchQuery = ref('')
const filterType = ref<InspectionType | ''>('')
const filterStatus = ref<InspectionStatus | ''>('')
const showForm = ref(false)
const showDetail = ref(false)
const selectedInspection = ref<Inspection | null>(null)
const deleteTarget = ref<Inspection | null>(null)

onMounted(async () => {
  await Promise.all([inspStore.fetchAll(), clientsStore.fetchAll(), objectsStore.fetchAll()])
})

const columns = [
  { key: 'objectName', label: "Об'єкт" },
  { key: 'clientName', label: 'Клієнт' },
  { key: 'typeName', label: 'Тип', width: '120px' },
  { key: 'statusName', label: 'Статус', width: '120px' },
  { key: 'scheduledDate', label: 'Дата', width: '100px' },
  { key: 'findings', label: 'Знахідки', width: '80px' },
]

const filteredInspections = computed(() => {
  let items = inspStore.inspections
  if (filterType.value) items = items.filter(i => i.type === filterType.value)
  if (filterStatus.value) items = items.filter(i => i.status === filterStatus.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    items = items.filter(i => {
      const obj = objectsStore.getById(i.objectId)
      const cl = clientsStore.getById(i.clientId)
      return (obj?.name || '').toLowerCase().includes(q) || (cl?.companyName || '').toLowerCase().includes(q)
    })
  }
  return items.map(i => {
    const obj = objectsStore.getById(i.objectId)
    const cl = clientsStore.getById(i.clientId)
    return {
      ...i,
      objectName: obj?.name || '—',
      clientName: cl?.companyName || '—',
      typeName: INSPECTION_TYPE_LABELS[i.type] || i.type,
      statusName: INSPECTION_STATUS_LABELS[i.status] || i.status,
      scheduledDate: new Date(i.scheduledAt).toLocaleDateString('uk-UA'),
      findings: (i.findings?.length || 0).toString(),
    }
  })
})

const form = ref({
  objectId: '', clientId: '', type: 'initial' as InspectionType,
  status: 'planned' as InspectionStatus, scheduledAt: '', assignedTo: '', notes: '',
  checklist: [] as { question: string; answer: string }[],
  findings: [] as string[], riskZones: [] as string[], recommendations: [] as string[],
})

function openCreate() {
  form.value = {
    objectId: '', clientId: '', type: 'initial', status: 'planned',
    scheduledAt: new Date().toISOString().split('T')[0], assignedTo: '', notes: '',
    checklist: [], findings: [], riskZones: [], recommendations: [],
  }
  showForm.value = true
}

function openDetail(row: Record<string, unknown>) {
  selectedInspection.value = inspStore.getById(row.id as string) || null
  showDetail.value = true
}

async function onSave() {
  if (!form.value.objectId) return
  await inspStore.add({
    ...form.value,
    scheduledAt: new Date(form.value.scheduledAt).toISOString(),
  })
  showForm.value = false
}

function addChecklist() {
  form.value.checklist.push({ question: '', answer: '' })
}

function addFinding() {
  form.value.findings.push('')
}

function addRiskZone() {
  form.value.riskZones.push('')
}

function addRecommendation() {
  form.value.recommendations.push('')
}

async function onDelete() {
  if (deleteTarget.value) {
    await inspStore.remove(deleteTarget.value.id)
    deleteTarget.value = null
  }
}
</script>

<template>
  <div>
    <PageHeader title="Обстеження" subtitle="Інспекції та аудити об'єктів">
      <template #actions>
        <button class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2" @click="openCreate">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          Нове обстеження
        </button>
      </template>
    </PageHeader>

    <div class="flex items-center gap-4 mb-4">
      <div class="flex-1"><SearchBar v-model="searchQuery" placeholder="Пошук за об'єктом, клієнтом..." /></div>
      <select v-model="filterType" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
        <option value="">Всі типи</option>
        <option value="initial">Первинне</option>
        <option value="periodic">Періодичне</option>
        <option value="audit">Аудит</option>
      </select>
      <select v-model="filterStatus" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
        <option value="">Всі статуси</option>
        <option value="planned">Заплановано</option>
        <option value="in_progress">В роботі</option>
        <option value="completed">Завершено</option>
        <option value="cancelled">Скасовано</option>
      </select>
    </div>

    <div v-if="inspStore.loading" class="text-center py-8 text-gray-500">Завантаження...</div>
    <DataTable v-else :columns="columns" :rows="(filteredInspections as unknown as Record<string, unknown>[])" empty-text="Обстежень ще немає." @row-click="openDetail">
      <template #cell-statusName="{ row }"><StatusBadge :status="String(row.status)" /></template>
      <template #cell-typeName="{ row }"><StatusBadge :status="String(row.type)" /></template>
    </DataTable>

    <!-- Detail Modal -->
    <BaseModal :show="showDetail && !!selectedInspection" title="Деталі обстеження" size="lg" @close="showDetail = false">
      <div v-if="selectedInspection" class="space-y-4">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div><span class="text-gray-500">Тип:</span> <StatusBadge :status="selectedInspection.type" /></div>
          <div><span class="text-gray-500">Статус:</span> <StatusBadge :status="selectedInspection.status" /></div>
          <div><span class="text-gray-500">Дата:</span> {{ new Date(selectedInspection.scheduledAt).toLocaleDateString('uk-UA') }}</div>
          <div v-if="selectedInspection.completedAt"><span class="text-gray-500">Завершено:</span> {{ new Date(selectedInspection.completedAt).toLocaleDateString('uk-UA') }}</div>
        </div>

        <div v-if="selectedInspection.checklist?.length">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Чек-лист</h4>
          <div v-for="(item, i) in selectedInspection.checklist" :key="i" class="border-l-2 border-blue-200 pl-3 mb-2">
            <p class="text-sm font-medium">{{ item.question }}</p>
            <p class="text-sm text-gray-600">{{ item.answer }}</p>
          </div>
        </div>

        <div v-if="selectedInspection.findings?.length">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Знахідки</h4>
          <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li v-for="(f, i) in selectedInspection.findings" :key="i">{{ f }}</li>
          </ul>
        </div>

        <div v-if="selectedInspection.riskZones?.length">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Зони ризику</h4>
          <div class="flex flex-wrap gap-2">
            <span v-for="(z, i) in selectedInspection.riskZones" :key="i" class="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium">{{ z }}</span>
          </div>
        </div>

        <div v-if="selectedInspection.recommendations?.length">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Рекомендації</h4>
          <ol class="list-decimal list-inside text-sm text-gray-700 space-y-1">
            <li v-for="(r, i) in selectedInspection.recommendations" :key="i">{{ r }}</li>
          </ol>
        </div>

        <div v-if="selectedInspection.notes" class="pt-2 border-t">
          <p class="text-sm text-gray-600">{{ selectedInspection.notes }}</p>
        </div>
      </div>
    </BaseModal>

    <!-- Create Form -->
    <BaseModal :show="showForm" title="Нове обстеження" size="lg" @close="showForm = false">
      <form class="space-y-4" @submit.prevent="onSave">
        <div class="grid grid-cols-2 gap-4">
          <FormField label="Об'єкт" required>
            <select v-model="form.objectId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" @change="form.clientId = objectsStore.getById(form.objectId)?.clientId || ''">
              <option value="">Оберіть об'єкт</option>
              <option v-for="o in objectsStore.objects" :key="o.id" :value="o.id">{{ o.name }}</option>
            </select>
          </FormField>
          <FormField label="Тип">
            <select v-model="form.type" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="initial">Первинне</option>
              <option value="periodic">Періодичне</option>
              <option value="audit">Аудит</option>
            </select>
          </FormField>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <FormField label="Дата">
            <input v-model="form.scheduledAt" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </FormField>
          <FormField label="Статус">
            <select v-model="form.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="planned">Заплановано</option>
              <option value="in_progress">В роботі</option>
              <option value="completed">Завершено</option>
            </select>
          </FormField>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Чек-лист</span>
            <button type="button" class="text-xs text-blue-600" @click="addChecklist">+ Додати</button>
          </div>
          <div v-for="(item, i) in form.checklist" :key="i" class="grid grid-cols-2 gap-2 mb-2">
            <input v-model="item.question" class="px-2 py-1.5 border rounded text-sm" placeholder="Питання" />
            <input v-model="item.answer" class="px-2 py-1.5 border rounded text-sm" placeholder="Відповідь" />
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Знахідки</span>
            <button type="button" class="text-xs text-blue-600" @click="addFinding">+ Додати</button>
          </div>
          <input v-for="(_, i) in form.findings" :key="i" v-model="form.findings[i]" class="w-full px-2 py-1.5 border rounded text-sm mb-2" placeholder="Опис знахідки" />
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Зони ризику</span>
            <button type="button" class="text-xs text-blue-600" @click="addRiskZone">+ Додати</button>
          </div>
          <input v-for="(_, i) in form.riskZones" :key="i" v-model="form.riskZones[i]" class="w-full px-2 py-1.5 border rounded text-sm mb-2" placeholder="Назва зони" />
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Рекомендації</span>
            <button type="button" class="text-xs text-blue-600" @click="addRecommendation">+ Додати</button>
          </div>
          <input v-for="(_, i) in form.recommendations" :key="i" v-model="form.recommendations[i]" class="w-full px-2 py-1.5 border rounded text-sm mb-2" placeholder="Рекомендація" />
        </div>

        <FormField label="Нотатки">
          <textarea v-model="form.notes" rows="2" class="w-full px-3 py-2 border rounded-lg text-sm resize-none" />
        </FormField>
      </form>
      <template #footer>
        <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200" @click="showForm = false">Скасувати</button>
        <button class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700" @click="onSave">Створити</button>
      </template>
    </BaseModal>

    <ConfirmDialog :show="!!deleteTarget" title="Видалити обстеження" message="Ви впевнені?" confirm-label="Видалити" confirm-variant="danger" @confirm="onDelete" @cancel="deleteTarget = null" />
  </div>
</template>
