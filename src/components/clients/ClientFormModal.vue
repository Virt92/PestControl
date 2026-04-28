<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import FormField from '@/components/ui/FormField.vue'
import type { Client, ClientType, ClientStatus, ContactPerson } from '@/types'

const props = defineProps<{
  show: boolean
  client?: Client | null
}>()

const emit = defineEmits<{
  close: []
  save: [data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>]
}>()

const activeTab = ref<'main' | 'contacts' | 'requisites'>('main')

const form = ref({
  companyName: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  type: 'b2b' as ClientType,
  status: 'active' as ClientStatus,
  notes: '',
  contacts: [] as ContactPerson[],
  edrpou: '',
  inn: '',
  legalAddress: '',
  bankDetails: '',
})

watch(() => props.show, (val) => {
  activeTab.value = 'main'
  if (val && props.client) {
    form.value = {
      companyName: props.client.companyName,
      contactPerson: props.client.contactPerson,
      phone: props.client.phone,
      email: props.client.email,
      address: props.client.address,
      type: props.client.type,
      status: props.client.status,
      notes: props.client.notes,
      contacts: props.client.contacts ? [...props.client.contacts] : [],
      edrpou: props.client.edrpou || '',
      inn: props.client.inn || '',
      legalAddress: props.client.legalAddress || '',
      bankDetails: props.client.bankDetails || '',
    }
  } else if (val) {
    form.value = {
      companyName: '', contactPerson: '', phone: '', email: '',
      address: '', type: 'b2b', status: 'active', notes: '',
      contacts: [], edrpou: '', inn: '', legalAddress: '', bankDetails: '',
    }
  }
})

function addContact() {
  form.value.contacts.push({ name: '', role: '', phone: '', email: '', comment: '' })
}

function removeContact(i: number) {
  form.value.contacts.splice(i, 1)
}

function onSubmit() {
  if (!form.value.companyName.trim()) return
  emit('save', { ...form.value } as any)
}
</script>

<template>
  <BaseModal :show="show" :title="client ? 'Редагувати клієнта' : 'Новий клієнт'" size="lg" @close="$emit('close')">
    <div class="flex border-b border-gray-200 mb-4">
      <button
        v-for="tab in [{ id: 'main', label: 'Основне' }, { id: 'contacts', label: 'Контакти' }, { id: 'requisites', label: 'Реквізити' }]"
        :key="tab.id"
        :class="['px-4 py-2 text-sm font-medium -mb-px', activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700']"
        @click="activeTab = tab.id as any"
      >{{ tab.label }}</button>
    </div>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <div v-show="activeTab === 'main'">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Назва / ПІБ" required>
            <input v-model="form.companyName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ТОВ «Назва» або ПІБ" />
          </FormField>
          <FormField label="Тип клієнта" required>
            <select v-model="form.type" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="b2b">B2B (Юр. особа)</option>
              <option value="b2c">B2C (Фіз. особа)</option>
            </select>
          </FormField>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Контактна особа">
            <input v-model="form.contactPerson" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Прізвище Ім'я" />
          </FormField>
          <FormField label="Телефон">
            <input v-model="form.phone" type="tel" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+380..." />
          </FormField>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Email">
            <input v-model="form.email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="email@example.com" />
          </FormField>
          <FormField label="Статус">
            <select v-model="form.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="active">Активний</option>
              <option value="inactive">Неактивний</option>
            </select>
          </FormField>
        </div>
        <FormField label="Адреса" class="mb-4">
          <input v-model="form.address" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Місто, вулиця, будинок" />
        </FormField>
        <FormField label="Нотатки">
          <textarea v-model="form.notes" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Додаткова інформація..." />
        </FormField>
      </div>

      <div v-show="activeTab === 'contacts'">
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm text-gray-500">Контактні особи клієнта</p>
          <button type="button" class="text-sm text-blue-600 hover:text-blue-700" @click="addContact">+ Додати контакт</button>
        </div>
        <div v-if="!form.contacts.length" class="text-center text-gray-400 py-6 text-sm">Контактних осіб ще не додано</div>
        <div v-for="(c, i) in form.contacts" :key="i" class="border border-gray-200 rounded-lg p-3 mb-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-600">Контакт {{ i + 1 }}</span>
            <button type="button" class="text-red-500 hover:text-red-700 text-xs" @click="removeContact(i)">Видалити</button>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <input v-model="c.name" type="text" class="px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="ПІБ" />
            <input v-model="c.role" type="text" class="px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="Посада / роль" />
            <input v-model="c.phone" type="tel" class="px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="Телефон" />
            <input v-model="c.email" type="email" class="px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="Email" />
          </div>
          <input v-model="c.comment" type="text" class="mt-2 w-full px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="Коментар" />
        </div>
      </div>

      <div v-show="activeTab === 'requisites'">
        <p class="text-sm text-gray-500 mb-3">Юридичні реквізити (для B2B клієнтів)</p>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <FormField label="ЄДРПОУ">
            <input v-model="form.edrpou" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="12345678" />
          </FormField>
          <FormField label="ІПН">
            <input v-model="form.inn" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="1234567890" />
          </FormField>
        </div>
        <FormField label="Юридична адреса" class="mb-4">
          <input v-model="form.legalAddress" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Юридична адреса" />
        </FormField>
        <FormField label="Банківські реквізити">
          <textarea v-model="form.bankDetails" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="IBAN, назва банку..." />
        </FormField>
      </div>
    </form>

    <template #footer>
      <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200" @click="$emit('close')">Скасувати</button>
      <button class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700" @click="onSubmit">{{ client ? 'Зберегти' : 'Створити' }}</button>
    </template>
  </BaseModal>
</template>
