<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import FormField from '@/components/ui/FormField.vue'
import { useObjectsStore } from '@/stores/objects'
import { useClientsStore } from '@/stores/clients'
import type { Visit, VisitType, VisitStatus } from '@/types'

const props = defineProps<{
  show: boolean
  visit?: Visit | null
}>()

const emit = defineEmits<{
  close: []
  save: [data: Omit<Visit, 'id' | 'createdAt'>]
}>()

const objectsStore = useObjectsStore()
const clientsStore = useClientsStore()

const form = ref({
  objectId: '',
  clientId: '',
  assignedTo: '',
  scheduledAt: '',
  completedAt: null as string | null,
  type: 'monitoring_check' as VisitType,
  status: 'planned' as VisitStatus,
  notes: '',
  pointsChecked: 0,
  pointsTotal: 0
})

const selectedClient = computed(() => {
  const obj = objectsStore.getById(form.value.objectId)
  return obj ? clientsStore.getById(obj.clientId) : undefined
})

watch(() => form.value.objectId, (objectId) => {
  const obj = objectsStore.getById(objectId)
  if (obj) {
    form.value.clientId = obj.clientId
  }
})

watch(() => props.show, (val) => {
  if (val && props.visit) {
    form.value = {
      objectId: props.visit.objectId,
      clientId: props.visit.clientId,
      assignedTo: props.visit.assignedTo,
      scheduledAt: props.visit.scheduledAt.slice(0, 16),
      completedAt: props.visit.completedAt,
      type: props.visit.type,
      status: props.visit.status,
      notes: props.visit.notes,
      pointsChecked: props.visit.pointsChecked,
      pointsTotal: props.visit.pointsTotal
    }
  } else if (val) {
    form.value = {
      objectId: '', clientId: '', assignedTo: '',
      scheduledAt: new Date().toISOString().slice(0, 16),
      completedAt: null, type: 'monitoring_check', status: 'planned',
      notes: '', pointsChecked: 0, pointsTotal: 0
    }
  }
})

function onSubmit() {
  if (!form.value.objectId || !form.value.scheduledAt) return
  emit('save', {
    ...form.value,
    scheduledAt: new Date(form.value.scheduledAt).toISOString()
  })
}
</script>

<template>
  <BaseModal :show="show" :title="visit ? 'Редагувати виїзд' : 'Запланувати виїзд'" size="lg" @close="$emit('close')">
    <form class="space-y-4" @submit.prevent="onSubmit">
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Об'єкт" required>
          <select
            v-model="form.objectId"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Оберіть об'єкт</option>
            <option v-for="o in objectsStore.objects" :key="o.id" :value="o.id">
              {{ o.name }} — {{ o.address }}
            </option>
          </select>
        </FormField>

        <FormField label="Клієнт">
          <input
            :value="selectedClient?.companyName ?? '—'"
            type="text"
            disabled
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
          />
        </FormField>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <FormField label="Тип виїзду" required>
          <select
            v-model="form.type"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="inspection">Обстеження</option>
            <option value="treatment">Обробка</option>
            <option value="monitoring_check">Перевірка точок</option>
            <option value="follow_up">Контрольний виїзд</option>
          </select>
        </FormField>

        <FormField label="Дата та час" required>
          <input
            v-model="form.scheduledAt"
            type="datetime-local"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </FormField>

        <FormField label="Статус">
          <select
            v-model="form.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="planned">Заплановано</option>
            <option value="in_progress">В роботі</option>
            <option value="completed">Завершено</option>
            <option value="cancelled">Скасовано</option>
          </select>
        </FormField>
      </div>

      <FormField label="Виконавець">
        <input
          v-model="form.assignedTo"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="ПІБ майстра"
        />
      </FormField>

      <FormField label="Нотатки">
        <textarea
          v-model="form.notes"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          placeholder="Додаткова інформація про виїзд..."
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
        {{ visit ? 'Зберегти' : 'Створити' }}
      </button>
    </template>
  </BaseModal>
</template>
