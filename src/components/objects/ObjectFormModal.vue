<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import FormField from '@/components/ui/FormField.vue'
import { useClientsStore } from '@/stores/clients'
import type { SiteObject, ObjectStatus } from '@/types'

const props = defineProps<{
  show: boolean
  object?: SiteObject | null
  preselectedClientId?: string
}>()

const emit = defineEmits<{
  close: []
  save: [data: Omit<SiteObject, 'id' | 'createdAt' | 'updatedAt'>]
}>()

const clientsStore = useClientsStore()

const form = ref({
  clientId: '',
  name: '',
  address: '',
  type: '',
  floors: 1,
  contactOnSite: '',
  contactPhone: '',
  accessNotes: '',
  floorPlanUrl: '',
  status: 'active' as ObjectStatus
})

watch(() => props.show, (val) => {
  if (val && props.object) {
    form.value = {
      clientId: props.object.clientId,
      name: props.object.name,
      address: props.object.address,
      type: props.object.type,
      floors: props.object.floors,
      contactOnSite: props.object.contactOnSite,
      contactPhone: props.object.contactPhone,
      accessNotes: props.object.accessNotes,
      floorPlanUrl: props.object.floorPlanUrl,
      status: props.object.status
    }
  } else if (val) {
    form.value = {
      clientId: props.preselectedClientId || '',
      name: '', address: '', type: '', floors: 1,
      contactOnSite: '', contactPhone: '', accessNotes: '',
      floorPlanUrl: '', status: 'active'
    }
  }
})

const modalTitle = computed(() => props.object ? 'Редагувати об\'єкт' : 'Новий об\'єкт')

function onSubmit() {
  if (!form.value.name.trim() || !form.value.clientId) return
  emit('save', { ...form.value })
}
</script>

<template>
  <BaseModal :show="show" :title="modalTitle" size="lg" @close="$emit('close')">
    <form class="space-y-4" @submit.prevent="onSubmit">
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Клієнт" required>
          <select
            v-model="form.clientId"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Оберіть клієнта</option>
            <option v-for="c in clientsStore.clients" :key="c.id" :value="c.id">
              {{ c.companyName }}
            </option>
          </select>
        </FormField>

        <FormField label="Назва об'єкта" required>
          <input
            v-model="form.name"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Завод, Склад №2, Офіс..."
          />
        </FormField>
      </div>

      <FormField label="Адреса" required>
        <input
          v-model="form.address"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Місто, вулиця, будинок"
        />
      </FormField>

      <div class="grid grid-cols-3 gap-4">
        <FormField label="Тип об'єкта">
          <select
            v-model="form.type"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Оберіть тип</option>
            <option value="factory">Завод / Виробництво</option>
            <option value="warehouse">Склад</option>
            <option value="office">Офіс</option>
            <option value="restaurant">Ресторан / Кафе</option>
            <option value="shop">Магазин</option>
            <option value="apartment">Квартира</option>
            <option value="house">Приватний будинок</option>
            <option value="other">Інше</option>
          </select>
        </FormField>

        <FormField label="Кількість поверхів">
          <input
            v-model.number="form.floors"
            type="number"
            min="1"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </FormField>

        <FormField label="Статус">
          <select
            v-model="form.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="active">Активний</option>
            <option value="inactive">Неактивний</option>
            <option value="suspended">Призупинено</option>
          </select>
        </FormField>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <FormField label="Контактна особа на об'єкті">
          <input
            v-model="form.contactOnSite"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </FormField>

        <FormField label="Телефон контакту">
          <input
            v-model="form.contactPhone"
            type="tel"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </FormField>
      </div>

      <FormField label="Умови доступу">
        <textarea
          v-model="form.accessNotes"
          rows="2"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          placeholder="Час доступу, пропуск, ключі..."
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
        {{ object ? 'Зберегти' : 'Створити' }}
      </button>
    </template>
  </BaseModal>
</template>
