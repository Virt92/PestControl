<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClientsStore } from '@/stores/clients'
import { useObjectsStore } from '@/stores/objects'
import type { Client } from '@/types'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import DataTable from '@/components/ui/DataTable.vue'
import ClientFormModal from '@/components/clients/ClientFormModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const clientsStore = useClientsStore()
const objectsStore = useObjectsStore()

const clientId = computed(() => route.params.id as string)
const client = computed(() => clientsStore.getById(clientId.value))
const clientObjects = computed(() => objectsStore.getByClientId(clientId.value))

const showEdit = ref(false)
const showDelete = ref(false)

const objectColumns = [
  { key: 'name', label: 'Назва' },
  { key: 'address', label: 'Адреса' },
  { key: 'type', label: 'Тип' },
  { key: 'status', label: 'Статус', width: '120px' }
]

function onSave(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) {
  clientsStore.update(clientId.value, data)
  showEdit.value = false
}

function onDelete() {
  clientsStore.remove(clientId.value)
  router.push({ name: 'clients' })
}

function goToObject(row: Record<string, unknown>) {
  router.push({ name: 'object-detail', params: { id: row.id as string } })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('uk-UA')
}
</script>

<template>
  <div v-if="client">
    <div class="mb-4">
      <button
        class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        @click="router.push({ name: 'clients' })"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Назад до клієнтів
      </button>
    </div>

    <PageHeader :title="client.companyName" :subtitle="`Клієнт з ${formatDate(client.createdAt)}`">
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

    <div class="grid grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-xl border border-gray-200 p-5 col-span-2">
        <h3 class="text-sm font-semibold text-gray-500 uppercase mb-4">Інформація</h3>
        <dl class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <dt class="text-gray-500">Тип</dt>
            <dd class="mt-1"><StatusBadge :status="client.type" /></dd>
          </div>
          <div>
            <dt class="text-gray-500">Статус</dt>
            <dd class="mt-1"><StatusBadge :status="client.status" /></dd>
          </div>
          <div>
            <dt class="text-gray-500">Контактна особа</dt>
            <dd class="mt-1 text-gray-900">{{ client.contactPerson || '—' }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Телефон</dt>
            <dd class="mt-1 text-gray-900">{{ client.phone || '—' }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Email</dt>
            <dd class="mt-1 text-gray-900">{{ client.email || '—' }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Адреса</dt>
            <dd class="mt-1 text-gray-900">{{ client.address || '—' }}</dd>
          </div>
        </dl>
        <div v-if="client.notes" class="mt-4 pt-4 border-t border-gray-100">
          <dt class="text-sm text-gray-500">Нотатки</dt>
          <dd class="mt-1 text-sm text-gray-700">{{ client.notes }}</dd>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p class="text-3xl font-bold text-blue-600">{{ clientObjects.length }}</p>
          <p class="text-sm text-gray-500 mt-1">Об'єктів</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p class="text-3xl font-bold text-green-600">{{ clientObjects.filter(o => o.status === 'active').length }}</p>
          <p class="text-sm text-gray-500 mt-1">Активних</p>
        </div>
      </div>
    </div>

    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">Об'єкти клієнта</h2>
        <button
          class="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
          @click="router.push({ name: 'objects' })"
        >
          + Додати об'єкт
        </button>
      </div>
      <DataTable
        :columns="objectColumns"
        :rows="(clientObjects as unknown as Record<string, unknown>[])"
        empty-text="У цього клієнта ще немає об'єктів."
        @row-click="goToObject"
      >
        <template #cell-status="{ value }">
          <StatusBadge :status="String(value)" />
        </template>
      </DataTable>
    </div>

    <ClientFormModal
      :show="showEdit"
      :client="client"
      @close="showEdit = false"
      @save="onSave"
    />

    <ConfirmDialog
      :show="showDelete"
      title="Видалити клієнта"
      :message="`Ви впевнені, що хочете видалити клієнта «${client.companyName}»?`"
      confirm-label="Видалити"
      confirm-variant="danger"
      @confirm="onDelete"
      @cancel="showDelete = false"
    />
  </div>

  <div v-else class="text-center py-12">
    <p class="text-gray-500">Клієнта не знайдено</p>
    <button
      class="mt-4 text-blue-600 hover:text-blue-800 text-sm"
      @click="router.push({ name: 'clients' })"
    >
      Повернутися до списку
    </button>
  </div>
</template>
