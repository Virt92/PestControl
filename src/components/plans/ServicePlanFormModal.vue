<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useClientsStore } from '@/stores/clients'
import { useObjectsStore } from '@/stores/objects'
import type { ServicePlan } from '@/types'
import BaseModal from '@/components/ui/BaseModal.vue'
import FormField from '@/components/ui/FormField.vue'

const props = defineProps<{ show: boolean; plan?: ServicePlan | null }>()
const emit = defineEmits<{ close: []; save: [data: Omit<ServicePlan, 'id' | 'createdAt'>] }>()

const clientsStore = useClientsStore()
const objectsStore = useObjectsStore()

const form = ref({
  clientId: '',
  objectId: '',
  title: '',
  frequency: 'monthly',
  pestTypes: '' as string,
  zones: '' as string,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  status: 'active' as 'active' | 'paused' | 'completed',
  notes: ''
})

const modalTitle = computed(() => props.plan ? 'Редагувати план' : 'Новий план обслуговування')

const clientObjects = computed(() => {
  if (!form.value.clientId) return []
  return objectsStore.objects.filter(o => o.clientId === form.value.clientId)
})

watch(() => props.show, (val) => {
  if (val && props.plan) {
    form.value = {
      clientId: props.plan.clientId,
      objectId: props.plan.objectId,
      title: props.plan.title,
      frequency: props.plan.frequency,
      pestTypes: props.plan.pestTypes.join(', '),
      zones: props.plan.zones.join(', '),
      startDate: props.plan.startDate,
      endDate: props.plan.endDate ?? '',
      status: props.plan.status,
      notes: props.plan.notes
    }
  } else if (val) {
    form.value = {
      clientId: '', objectId: '', title: '', frequency: 'monthly',
      pestTypes: '', zones: '', startDate: new Date().toISOString().slice(0, 10),
      endDate: '', status: 'active', notes: ''
    }
  }
})

function onSubmit() {
  emit('save', {
    clientId: form.value.clientId,
    objectId: form.value.objectId,
    title: form.value.title,
    frequency: form.value.frequency,
    pestTypes: form.value.pestTypes.split(',').map(s => s.trim()).filter(Boolean),
    zones: form.value.zones.split(',').map(s => s.trim()).filter(Boolean),
    startDate: form.value.startDate,
    endDate: form.value.endDate || null,
    status: form.value.status,
    notes: form.value.notes
  })
}
</script>

<template>
  <BaseModal :show="show" :title="modalTitle" size="lg" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="onSubmit">
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Клієнт" required>
          <select v-model="form.clientId" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
            <option value="">Оберіть клієнта</option>
            <option v-for="c in clientsStore.clients" :key="c.id" :value="c.id">{{ c.companyName }}</option>
          </select>
        </FormField>
        <FormField label="Об'єкт" required>
          <select v-model="form.objectId" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
            <option value="">Оберіть об'єкт</option>
            <option v-for="o in clientObjects" :key="o.id" :value="o.id">{{ o.name }}</option>
          </select>
        </FormField>
      </div>

      <FormField label="Назва плану" required>
        <input v-model="form.title" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Щомісячна дератизація" />
      </FormField>

      <div class="grid grid-cols-3 gap-4">
        <FormField label="Частота">
          <select v-model="form.frequency" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
            <option value="weekly">Щотижня</option>
            <option value="biweekly">Раз на 2 тижні</option>
            <option value="monthly">Щомісяця</option>
            <option value="quarterly">Щоквартально</option>
            <option value="custom">Інше</option>
          </select>
        </FormField>
        <FormField label="Дата початку" required>
          <input v-model="form.startDate" type="date" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </FormField>
        <FormField label="Дата завершення">
          <input v-model="form.endDate" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </FormField>
      </div>

      <FormField label="Типи шкідників (через кому)">
        <input v-model="form.pestTypes" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Гризуни, Таргани, Мурахи" />
      </FormField>

      <FormField label="Зони (через кому)">
        <input v-model="form.zones" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Склад, Кухня, Підвал" />
      </FormField>

      <FormField label="Нотатки">
        <textarea v-model="form.notes" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" />
      </FormField>
    </form>

    <template #footer>
      <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200" @click="emit('close')">Скасувати</button>
      <button class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700" @click="onSubmit">Зберегти</button>
    </template>
  </BaseModal>
</template>
