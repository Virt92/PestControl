<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import FormField from '@/components/ui/FormField.vue'
import { useObjectsStore } from '@/stores/objects'
import type { MonitoringPoint, PointType, PointStatus } from '@/types'

const props = defineProps<{
  show: boolean
  point?: MonitoringPoint | null
  preselectedObjectId?: string
}>()

const emit = defineEmits<{
  close: []
  save: [data: Omit<MonitoringPoint, 'id'>]
}>()

const objectsStore = useObjectsStore()

const form = ref({
  objectId: '',
  number: 1,
  tagId: '',
  type: 'trap' as PointType,
  zone: '',
  floor: '1',
  positionX: 50,
  positionY: 50,
  status: 'active' as PointStatus,
  installedAt: new Date().toISOString().slice(0, 10),
  lastCheckedAt: null as string | null,
  notes: ''
})

function generateTagId(): string {
  return 'QR-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase()
}

watch(() => props.show, (val) => {
  if (val && props.point) {
    form.value = {
      objectId: props.point.objectId,
      number: props.point.number,
      tagId: props.point.tagId,
      type: props.point.type,
      zone: props.point.zone,
      floor: props.point.floor,
      positionX: props.point.positionX,
      positionY: props.point.positionY,
      status: props.point.status,
      installedAt: props.point.installedAt.slice(0, 10),
      lastCheckedAt: props.point.lastCheckedAt,
      notes: props.point.notes
    }
  } else if (val) {
    form.value = {
      objectId: props.preselectedObjectId || '',
      number: 1, tagId: generateTagId(),
      type: 'trap', zone: '', floor: '1',
      positionX: 50, positionY: 50, status: 'active',
      installedAt: new Date().toISOString().slice(0, 10),
      lastCheckedAt: null, notes: ''
    }
  }
})

function onSubmit() {
  if (!form.value.objectId) return
  emit('save', {
    ...form.value,
    installedAt: new Date(form.value.installedAt).toISOString(),
    qrStatus: (form.value.tagId ? 'bound' : 'free') as any,
    checkIntervalHours: form.value.type === 'bait_station' ? 72 : 168,
    nextCheckDue: null,
  })
}
</script>

<template>
  <BaseModal :show="show" :title="point ? 'Редагувати точку' : 'Нова точка моніторингу'" size="lg" @close="$emit('close')">
    <form class="space-y-4" @submit.prevent="onSubmit">
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Об'єкт" required>
          <select
            v-model="form.objectId"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Оберіть об'єкт</option>
            <option v-for="o in objectsStore.objects" :key="o.id" :value="o.id">
              {{ o.name }}
            </option>
          </select>
        </FormField>

        <FormField label="Номер точки" required>
          <input
            v-model.number="form.number"
            type="number"
            min="1"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </FormField>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <FormField label="Тип точки" required>
          <select
            v-model="form.type"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="trap">Пастка</option>
            <option value="bait_station">Приманкова станція</option>
            <option value="feeder">Годівниця</option>
            <option value="control_point">Контрольна точка</option>
          </select>
        </FormField>

        <FormField label="Зона">
          <input
            v-model="form.zone"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Цех, коридор, склад..."
          />
        </FormField>

        <FormField label="Поверх">
          <input
            v-model="form.floor"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="1, -1, підвал..."
          />
        </FormField>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <FormField label="QR Tag ID">
          <div class="flex gap-2">
            <input
              v-model="form.tagId"
              type="text"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
              readonly
            />
            <button
              type="button"
              class="px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
              @click="form.tagId = generateTagId()"
            >
              Новий
            </button>
          </div>
        </FormField>

        <FormField label="Дата встановлення">
          <input
            v-model="form.installedAt"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </FormField>

        <FormField label="Статус">
          <select
            v-model="form.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="active">Активна</option>
            <option value="inactive">Неактивна</option>
            <option value="maintenance">Обслуговування</option>
          </select>
        </FormField>
      </div>

      <FormField label="Нотатки">
        <textarea
          v-model="form.notes"
          rows="2"
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
        {{ point ? 'Зберегти' : 'Створити' }}
      </button>
    </template>
  </BaseModal>
</template>
