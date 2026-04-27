<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useClientsStore } from '@/stores/clients'
import { useObjectsStore } from '@/stores/objects'
import type { Client, ClientType, ClientStatus } from '@/types'
import PageHeader from '@/components/ui/PageHeader.vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import DataTable from '@/components/ui/DataTable.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import ClientFormModal from '@/components/clients/ClientFormModal.vue'

const router = useRouter()
const clientsStore = useClientsStore()
const objectsStore = useObjectsStore()

const searchQuery = ref('')
const filterType = ref<ClientType | ''>('')
const filterStatus = ref<ClientStatus | ''>('')
const showForm = ref(false)
const editingClient = ref<Client | null>(null)
const deleteTarget = ref<Client | null>(null)

const columns = [
  { key: 'companyName', label: 'Назва / ПІБ' },
  { key: 'type', label: 'Тип', width: '80px' },
  { key: 'contactPerson', label: 'Контакт' },
  { key: 'phone', label: 'Телефон', width: '140px' },
  { key: 'objectsCount', label: "Об'єкти", width: '80px' },
  { key: 'status', label: 'Статус', width: '120px' }
]

const filteredClients = computed(() => {
  return clientsStore.search(
    searchQuery.value,
    filterType.value || undefined,
    filterStatus.value || undefined
  ).map(c => ({
    ...c,
    objectsCount: objectsStore.getByClientId(c.id).length
  }))
})

function openCreate() {
  editingClient.value = null
  showForm.value = true
}

function onSave(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) {
  if (editingClient.value) {
    clientsStore.update(editingClient.value.id, data)
  } else {
    clientsStore.add(data)
  }
  showForm.value = false
}

function onDelete() {
  if (deleteTarget.value) {
    clientsStore.remove(deleteTarget.value.id)
    deleteTarget.value = null
  }
}

function goToDetail(row: Record<string, unknown>) {
  router.push({ name: 'client-detail', params: { id: row.id as string } })
}
</script>

<template>
  <div>
    <PageHeader title="Клієнти" subtitle="Управління клієнтською базою">
      <template #actions>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          @click="openCreate"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Додати клієнта
        </button>
      </template>
    </PageHeader>

    <div class="flex items-center gap-4 mb-4">
      <div class="flex-1">
        <SearchBar v-model="searchQuery" placeholder="Пошук за назвою, контактом, телефоном..." />
      </div>
      <select
        v-model="filterType"
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Всі типи</option>
        <option value="b2b">B2B</option>
        <option value="b2c">B2C</option>
      </select>
      <select
        v-model="filterStatus"
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Всі статуси</option>
        <option value="active">Активні</option>
        <option value="inactive">Неактивні</option>
      </select>
    </div>

    <DataTable
      :columns="columns"
      :rows="(filteredClients as unknown as Record<string, unknown>[])"
      empty-text="Клієнтів ще немає. Натисніть «Додати клієнта» щоб створити першого."
      @row-click="goToDetail"
    >
      <template #cell-type="{ value }">
        <StatusBadge :status="String(value)" />
      </template>
      <template #cell-status="{ value }">
        <StatusBadge :status="String(value)" />
      </template>
      <template #cell-companyName="{ row }">
        <div class="flex items-center gap-2">
          <span class="font-medium text-gray-900">{{ row.companyName }}</span>
        </div>
      </template>
    </DataTable>

    <ClientFormModal
      :show="showForm"
      :client="editingClient"
      @close="showForm = false"
      @save="onSave"
    />

    <ConfirmDialog
      :show="!!deleteTarget"
      title="Видалити клієнта"
      :message="`Ви впевнені, що хочете видалити клієнта «${deleteTarget?.companyName}»? Цю дію неможливо скасувати.`"
      confirm-label="Видалити"
      confirm-variant="danger"
      @confirm="onDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
