<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDocumentsStore } from '@/stores/documents'
import { useObjectsStore } from '@/stores/objects'
import { useClientsStore } from '@/stores/clients'
import type { Document, DocumentType, DocumentStatus } from '@/types'
import { DOCUMENT_TYPE_LABELS, DOCUMENT_STATUS_LABELS } from '@/types'
import PageHeader from '@/components/ui/PageHeader.vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import DataTable from '@/components/ui/DataTable.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import FormField from '@/components/ui/FormField.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

const documentsStore = useDocumentsStore()
const objectsStore = useObjectsStore()
const clientsStore = useClientsStore()

const searchQuery = ref('')
const filterType = ref<DocumentType | ''>('')
const filterStatus = ref<DocumentStatus | ''>('')
const showForm = ref(false)
const deleteTarget = ref<Document | null>(null)

const columns = [
  { key: 'title', label: 'Назва' },
  { key: 'type', label: 'Тип', width: '160px' },
  { key: 'objectName', label: "Об'єкт" },
  { key: 'clientName', label: 'Клієнт' },
  { key: 'status', label: 'Статус', width: '130px' },
  { key: 'createdAt', label: 'Створено', width: '120px' },
  { key: 'actions', label: '', width: '100px' }
]

const form = ref({
  objectId: '',
  clientId: '',
  visitId: null as string | null,
  type: 'act' as DocumentType,
  title: '',
  status: 'draft' as DocumentStatus,
  createdBy: 'Адмін'
})

const filteredDocs = computed(() => {
  return documentsStore.search(
    searchQuery.value,
    undefined,
    filterType.value || undefined,
    filterStatus.value || undefined
  ).map(d => ({
    ...d,
    objectName: objectsStore.getById(d.objectId)?.name ?? '—',
    clientName: clientsStore.getById(d.clientId)?.companyName ?? '—'
  })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

function openCreate() {
  form.value = {
    objectId: '', clientId: '', visitId: null,
    type: 'act', title: '', status: 'draft', createdBy: 'Адмін'
  }
  showForm.value = true
}

function onSave() {
  if (!form.value.title.trim()) return
  documentsStore.add({
    ...form.value,
    publishedAt: null
  })
  showForm.value = false
}

function publishDoc(doc: Document) {
  documentsStore.publish(doc.id)
}

function confirmDelete(doc: Document) {
  deleteTarget.value = doc
}

function onDelete() {
  if (deleteTarget.value) {
    documentsStore.remove(deleteTarget.value.id)
    deleteTarget.value = null
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('uk-UA')
}
</script>

<template>
  <div>
    <PageHeader title="Документи" subtitle="Акти, журнали моніторингу, звіти та PDF">
      <template #actions>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          @click="openCreate"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Створити документ
        </button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
        <p class="text-2xl font-bold text-blue-600">{{ documentsStore.documents.length }}</p>
        <p class="text-xs text-gray-500 mt-1">Всього</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
        <p class="text-2xl font-bold text-yellow-600">{{ documentsStore.drafts.length }}</p>
        <p class="text-xs text-gray-500 mt-1">Чернеток</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
        <p class="text-2xl font-bold text-green-600">{{ documentsStore.published.length }}</p>
        <p class="text-xs text-gray-500 mt-1">Опублікованих</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
        <p class="text-2xl font-bold text-gray-400">{{ documentsStore.documents.filter(d => d.status === 'archived').length }}</p>
        <p class="text-xs text-gray-500 mt-1">В архіві</p>
      </div>
    </div>

    <div class="flex items-center gap-4 mb-4">
      <div class="flex-1">
        <SearchBar v-model="searchQuery" placeholder="Пошук за назвою документа..." />
      </div>
      <select
        v-model="filterType"
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Всі типи</option>
        <option v-for="(label, key) in DOCUMENT_TYPE_LABELS" :key="key" :value="key">
          {{ label }}
        </option>
      </select>
      <select
        v-model="filterStatus"
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Всі статуси</option>
        <option v-for="(label, key) in DOCUMENT_STATUS_LABELS" :key="key" :value="key">
          {{ label }}
        </option>
      </select>
    </div>

    <DataTable
      :columns="columns"
      :rows="(filteredDocs as unknown as Record<string, unknown>[])"
      empty-text="Документів ще немає."
    >
      <template #cell-title="{ row }">
        <span class="font-medium text-gray-900">{{ row.title }}</span>
      </template>
      <template #cell-type="{ value }">
        {{ DOCUMENT_TYPE_LABELS[value as DocumentType] || value }}
      </template>
      <template #cell-status="{ value }">
        <StatusBadge :status="String(value)" />
      </template>
      <template #cell-createdAt="{ value }">
        {{ formatDate(value as string) }}
      </template>
      <template #cell-actions="{ row }">
        <div class="flex items-center gap-2">
          <button
            v-if="row.status === 'draft' || row.status === 'ready'"
            class="text-xs text-green-600 hover:text-green-800 font-medium"
            @click.stop="publishDoc(row as unknown as Document)"
          >
            Опублікувати
          </button>
          <button
            class="text-xs text-red-500 hover:text-red-700"
            @click.stop="confirmDelete(row as unknown as Document)"
          >
            Видалити
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Create Document Modal -->
    <BaseModal :show="showForm" title="Новий документ" size="lg" @close="showForm = false">
      <form class="space-y-4" @submit.prevent="onSave">
        <FormField label="Назва документа" required>
          <input
            v-model="form.title"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Назва документа"
          />
        </FormField>

        <div class="grid grid-cols-2 gap-4">
          <FormField label="Тип документа" required>
            <select
              v-model="form.type"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option v-for="(label, key) in DOCUMENT_TYPE_LABELS" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </FormField>

          <FormField label="Об'єкт">
            <select
              v-model="form.objectId"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Без об'єкта</option>
              <option v-for="o in objectsStore.objects" :key="o.id" :value="o.id">
                {{ o.name }}
              </option>
            </select>
          </FormField>
        </div>

        <FormField label="Клієнт">
          <select
            v-model="form.clientId"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Без клієнта</option>
            <option v-for="c in clientsStore.clients" :key="c.id" :value="c.id">
              {{ c.companyName }}
            </option>
          </select>
        </FormField>
      </form>

      <template #footer>
        <button
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          @click="showForm = false"
        >
          Скасувати
        </button>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          @click="onSave"
        >
          Створити
        </button>
      </template>
    </BaseModal>

    <ConfirmDialog
      :show="!!deleteTarget"
      title="Видалити документ"
      :message="`Видалити документ «${deleteTarget?.title}»?`"
      confirm-label="Видалити"
      confirm-variant="danger"
      @confirm="onDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
