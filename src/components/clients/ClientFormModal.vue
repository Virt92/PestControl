<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import FormField from '@/components/ui/FormField.vue'
import type { Client, ClientType, ClientStatus } from '@/types'

const props = defineProps<{
  show: boolean
  client?: Client | null
}>()

const emit = defineEmits<{
  close: []
  save: [data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>]
}>()

const form = ref({
  companyName: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  type: 'b2b' as ClientType,
  status: 'active' as ClientStatus,
  notes: ''
})

watch(() => props.show, (val) => {
  if (val && props.client) {
    form.value = {
      companyName: props.client.companyName,
      contactPerson: props.client.contactPerson,
      phone: props.client.phone,
      email: props.client.email,
      address: props.client.address,
      type: props.client.type,
      status: props.client.status,
      notes: props.client.notes
    }
  } else if (val) {
    form.value = {
      companyName: '', contactPerson: '', phone: '', email: '',
      address: '', type: 'b2b', status: 'active', notes: ''
    }
  }
})

function onSubmit() {
  if (!form.value.companyName.trim()) return
  emit('save', { ...form.value })
}
</script>

<template>
  <BaseModal :show="show" :title="client ? 'Редагувати клієнта' : 'Новий клієнт'" size="lg" @close="$emit('close')">
    <form class="space-y-4" @submit.prevent="onSubmit">
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Назва / ПІБ" required>
          <input
            v-model="form.companyName"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="ТОВ «Назва» або ПІБ"
          />
        </FormField>

        <FormField label="Тип клієнта" required>
          <select
            v-model="form.type"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="b2b">B2B (Юр. особа)</option>
            <option value="b2c">B2C (Фіз. особа)</option>
          </select>
        </FormField>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <FormField label="Контактна особа">
          <input
            v-model="form.contactPerson"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Прізвище Ім'я"
          />
        </FormField>

        <FormField label="Телефон">
          <input
            v-model="form.phone"
            type="tel"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="+380..."
          />
        </FormField>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <FormField label="Email">
          <input
            v-model="form.email"
            type="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="email@example.com"
          />
        </FormField>

        <FormField label="Статус">
          <select
            v-model="form.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="active">Активний</option>
            <option value="inactive">Неактивний</option>
          </select>
        </FormField>
      </div>

      <FormField label="Адреса">
        <input
          v-model="form.address"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Місто, вулиця, будинок"
        />
      </FormField>

      <FormField label="Нотатки">
        <textarea
          v-model="form.notes"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          placeholder="Додаткова інформація..."
        />
      </FormField>
    </form>

    <template #footer>
      <button
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        @click="$emit('close')"
      >
        Скасувати
      </button>
      <button
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        @click="onSubmit"
      >
        {{ client ? 'Зберегти' : 'Створити' }}
      </button>
    </template>
  </BaseModal>
</template>
