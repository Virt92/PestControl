<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
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
const activeTab = ref<'info' | 'contacts' | 'requisites' | 'objects'>('info')

const objectColumns = [
  { key: 'name', label: 'Назва' },
  { key: 'address', label: 'Адреса' },
  { key: 'type', label: 'Тип' },
  { key: 'status', label: 'Статус', width: '120px' }
]

onMounted(async () => {
  if (!clientsStore.clients.length) await clientsStore.fetchAll()
  if (!objectsStore.objects.length) await objectsStore.fetchAll()
})

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
      <button class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1" @click="router.push({ name: 'clients' })">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        Назад до клієнтів
      </button>
    </div>

    <PageHeader :title="client.companyName" :subtitle="`Клієнт з ${formatDate(client.createdAt)}`">
      <template #actions>
        <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200" @click="showEdit = true">Редагувати</button>
        <button class="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100" @click="showDelete = true">Видалити</button>
      </template>
    </PageHeader>

    <div class="flex border-b border-gray-200 mb-6">
      <button v-for="tab in [{id:'info',label:'Інформація'},{id:'contacts',label:`Контакти (${client.contacts?.length || 0})`},{id:'requisites',label:'Реквізити'},{id:'objects',label:`Об'єкти (${clientObjects.length})`}]" :key="tab.id"
        :class="['px-4 py-2 text-sm font-medium -mb-px', activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700']"
        @click="activeTab = tab.id as any">{{ tab.label }}</button>
    </div>

    <div v-if="activeTab === 'info'" class="grid grid-cols-3 gap-6">
      <div class="bg-white rounded-xl border border-gray-200 p-5 col-span-2">
        <h3 class="text-sm font-semibold text-gray-500 uppercase mb-4">Інформація</h3>
        <dl class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div><dt class="text-gray-500">Тип</dt><dd class="mt-1"><StatusBadge :status="client.type" /></dd></div>
          <div><dt class="text-gray-500">Статус</dt><dd class="mt-1"><StatusBadge :status="client.status" /></dd></div>
          <div><dt class="text-gray-500">Контактна особа</dt><dd class="mt-1 text-gray-900">{{ client.contactPerson || '—' }}</dd></div>
          <div><dt class="text-gray-500">Телефон</dt><dd class="mt-1 text-gray-900">{{ client.phone || '—' }}</dd></div>
          <div><dt class="text-gray-500">Email</dt><dd class="mt-1 text-gray-900">{{ client.email || '—' }}</dd></div>
          <div><dt class="text-gray-500">Адреса</dt><dd class="mt-1 text-gray-900">{{ client.address || '—' }}</dd></div>
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

    <div v-if="activeTab === 'contacts'">
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-500 uppercase mb-4">Контактні особи</h3>
        <div v-if="!client.contacts?.length" class="text-center text-gray-400 py-8">Контактних осіб ще не додано</div>
        <div v-else class="space-y-3">
          <div v-for="(c, i) in client.contacts" :key="i" class="border border-gray-100 rounded-lg p-4 flex items-start gap-4">
            <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">{{ c.name?.[0] || '?' }}</div>
            <div class="flex-1 grid grid-cols-2 gap-2 text-sm">
              <div><span class="text-gray-500">ПІБ:</span> <span class="font-medium">{{ c.name }}</span></div>
              <div><span class="text-gray-500">Посада:</span> {{ c.role || '—' }}</div>
              <div><span class="text-gray-500">Тел:</span> {{ c.phone || '—' }}</div>
              <div><span class="text-gray-500">Email:</span> {{ c.email || '—' }}</div>
              <div v-if="c.comment" class="col-span-2"><span class="text-gray-500">Коментар:</span> {{ c.comment }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'requisites'">
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-500 uppercase mb-4">Юридичні реквізити</h3>
        <dl class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div><dt class="text-gray-500">ЄДРПОУ</dt><dd class="mt-1 text-gray-900 font-mono">{{ client.edrpou || '—' }}</dd></div>
          <div><dt class="text-gray-500">ІПН</dt><dd class="mt-1 text-gray-900 font-mono">{{ client.inn || '—' }}</dd></div>
          <div class="col-span-2"><dt class="text-gray-500">Юридична адреса</dt><dd class="mt-1 text-gray-900">{{ client.legalAddress || '—' }}</dd></div>
          <div class="col-span-2"><dt class="text-gray-500">Банківські реквізити</dt><dd class="mt-1 text-gray-900 whitespace-pre-line">{{ client.bankDetails || '—' }}</dd></div>
        </dl>
      </div>
    </div>

    <div v-if="activeTab === 'objects'">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">Об'єкти клієнта</h2>
        <button class="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100" @click="router.push({ name: 'objects' })">+ Додати об'єкт</button>
      </div>
      <DataTable :columns="objectColumns" :rows="(clientObjects as unknown as Record<string, unknown>[])" empty-text="У цього клієнта ще немає об'єктів." @row-click="goToObject">
        <template #cell-status="{ value }"><StatusBadge :status="String(value)" /></template>
      </DataTable>
    </div>

    <ClientFormModal :show="showEdit" :client="client" @close="showEdit = false" @save="onSave" />
    <ConfirmDialog :show="showDelete" title="Видалити клієнта" :message="`Ви впевнені, що хочете видалити клієнта «${client.companyName}»?`" confirm-label="Видалити" confirm-variant="danger" @confirm="onDelete" @cancel="showDelete = false" />
  </div>
  <div v-else class="text-center py-12">
    <p class="text-gray-500">Клієнта не знайдено</p>
    <button class="mt-4 text-blue-600 hover:text-blue-800 text-sm" @click="router.push({ name: 'clients' })">Повернутися до списку</button>
  </div>
</template>
