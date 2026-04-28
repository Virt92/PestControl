<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMonitoringStore } from '@/stores/monitoring'
import { useObjectsStore } from '@/stores/objects'
import type { MonitoringPoint } from '@/types'
import { POINT_TYPE_LABELS } from '@/types'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import DataTable from '@/components/ui/DataTable.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import FormField from '@/components/ui/FormField.vue'
import PointFormModal from '@/components/monitoring/PointFormModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import QRCodeDisplay from '@/components/monitoring/QRCodeDisplay.vue'
import ActivityChart from '@/components/charts/ActivityChart.vue'

const route = useRoute()
const router = useRouter()
const monitoringStore = useMonitoringStore()
const objectsStore = useObjectsStore()

const pointId = computed(() => route.params.id as string)
const point = computed(() => monitoringStore.getPointById(pointId.value))
const obj = computed(() => point.value ? objectsStore.getById(point.value.objectId) : undefined)
const checks = computed(() => monitoringStore.getChecksByPointId(pointId.value))

const showEdit = ref(false)
const showDelete = ref(false)
const showCheckForm = ref(false)

const checkForm = ref({
  activity: false,
  activityLevel: 0,
  consumptionPercent: null as number | null,
  consumptionGrams: null as number | null,
  pestType: '',
  equipmentStatus: 'good',
  correctiveAction: '',
  notes: '',
  photos: [] as string[]
})

function onPhotoSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (!files) return
  Array.from(files).forEach(file => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      if (result) checkForm.value.photos.push(result)
    }
    reader.readAsDataURL(file)
  })
}

function removePhoto(index: number) {
  checkForm.value.photos.splice(index, 1)
}

const checkColumns = [
  { key: 'checkedAt', label: 'Дата' },
  { key: 'activity', label: 'Активність' },
  { key: 'activityLevel', label: 'Рівень' },
  { key: 'consumptionPercent', label: '% поїдання' },
  { key: 'consumptionGrams', label: 'Грами' },
  { key: 'equipmentStatus', label: 'Стан' },
  { key: 'correctiveAction', label: 'Корект. дія' },
  { key: 'checkedBy', label: 'Перевірив' }
]

function onSave(data: Omit<MonitoringPoint, 'id'>) {
  monitoringStore.updatePoint(pointId.value, data)
  showEdit.value = false
}

function onDelete() {
  monitoringStore.removePoint(pointId.value)
  router.push({ name: 'monitoring' })
}

function openCheckForm() {
  checkForm.value = {
    activity: false, activityLevel: 0,
    consumptionPercent: null, consumptionGrams: null,
    pestType: '', equipmentStatus: 'good',
    correctiveAction: '', notes: '',
    photos: []
  }
  showCheckForm.value = true
}

function submitCheck() {
  if (!point.value) return
  monitoringStore.addCheck({
    visitId: '',
    pointId: pointId.value,
    objectId: point.value.objectId,
    activity: checkForm.value.activity,
    activityLevel: checkForm.value.activityLevel,
    consumptionPercent: checkForm.value.consumptionPercent,
    consumptionGrams: checkForm.value.consumptionGrams,
    pestType: checkForm.value.pestType,
    photos: checkForm.value.photos,
    correctiveAction: checkForm.value.correctiveAction,
    equipmentStatus: checkForm.value.equipmentStatus,
    notes: checkForm.value.notes,
    result: checkForm.value.activity ? 'activity_detected' : 'clean',
    remainingGrams: null,
    refilledGrams: null,
    checkedAt: new Date().toISOString(),
    checkedBy: 'Адмін',
  } as any)
  showCheckForm.value = false
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div v-if="point">
    <div class="mb-4">
      <button
        class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        @click="router.push({ name: 'monitoring' })"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Назад до моніторингу
      </button>
    </div>

    <PageHeader
      :title="`Точка №${point.number}`"
      :subtitle="`${obj?.name ?? '—'} — ${point.zone || 'без зони'}`"
    >
      <template #actions>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
          @click="openCheckForm"
        >
          Записати перевірку
        </button>
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

    <div class="grid grid-cols-3 gap-6 mb-6">
      <div class="bg-white rounded-xl border border-gray-200 p-5 col-span-2">
        <h3 class="text-sm font-semibold text-gray-500 uppercase mb-4">Інформація про точку</h3>
        <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt class="text-gray-500">Тип</dt>
            <dd class="mt-1 text-gray-900">{{ POINT_TYPE_LABELS[point.type] }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Статус</dt>
            <dd class="mt-1"><StatusBadge :status="point.status" /></dd>
          </div>
          <div>
            <dt class="text-gray-500">QR Tag</dt>
            <dd class="mt-1 font-mono text-xs bg-gray-100 px-2 py-1 rounded inline-block">{{ point.tagId }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Об'єкт</dt>
            <dd class="mt-1">
              <button
                class="text-blue-600 hover:text-blue-800"
                @click="router.push({ name: 'object-detail', params: { id: point.objectId } })"
              >
                {{ obj?.name ?? '—' }}
              </button>
            </dd>
          </div>
          <div>
            <dt class="text-gray-500">Зона</dt>
            <dd class="mt-1 text-gray-900">{{ point.zone || '—' }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Поверх</dt>
            <dd class="mt-1 text-gray-900">{{ point.floor }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Встановлено</dt>
            <dd class="mt-1 text-gray-900">{{ formatDate(point.installedAt) }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Остання перевірка</dt>
            <dd class="mt-1 text-gray-900">{{ formatDate(point.lastCheckedAt) }}</dd>
          </div>
        </dl>
        <div v-if="point.notes" class="mt-4 pt-4 border-t border-gray-100">
          <dt class="text-sm text-gray-500">Нотатки</dt>
          <dd class="mt-1 text-sm text-gray-700">{{ point.notes }}</dd>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center">
          <QRCodeDisplay :tag-id="point.tagId" :size="140" />
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p class="text-3xl font-bold text-blue-600">{{ checks.length }}</p>
          <p class="text-sm text-gray-500 mt-1">Перевірок</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p class="text-3xl font-bold text-red-600">{{ checks.filter(c => c.activity).length }}</p>
          <p class="text-sm text-gray-500 mt-1">З активністю</p>
        </div>
      </div>
    </div>

    <div v-if="checks.length > 0" class="mb-6">
      <ActivityChart :checks="checks" title="Динаміка активності" />
    </div>

    <h2 class="text-lg font-semibold text-gray-900 mb-4">Історія перевірок</h2>
    <DataTable
      :columns="checkColumns"
      :rows="(checks as unknown as Record<string, unknown>[])"
      empty-text="Перевірок ще не було. Натисніть «Записати перевірку»."
    >
      <template #cell-checkedAt="{ value }">
        {{ formatDate(value as string) }}
      </template>
      <template #cell-activity="{ value }">
        <span :class="value ? 'text-red-600 font-medium' : 'text-green-600'">
          {{ value ? 'Так' : 'Ні' }}
        </span>
      </template>
      <template #cell-consumptionPercent="{ value }">
        {{ value != null ? `${value}%` : '—' }}
      </template>
      <template #cell-consumptionGrams="{ value }">
        {{ value != null ? `${value}г` : '—' }}
      </template>
    </DataTable>

    <!-- Check Form Modal -->
    <BaseModal :show="showCheckForm" title="Записати перевірку точки" size="lg" @close="showCheckForm = false">
      <form class="space-y-4" @submit.prevent="submitCheck">
        <div class="grid grid-cols-2 gap-4">
          <FormField label="Активність шкідників">
            <div class="flex items-center gap-3 mt-1">
              <label class="flex items-center gap-2 text-sm">
                <input v-model="checkForm.activity" type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                Виявлено активність
              </label>
            </div>
          </FormField>

          <FormField label="Рівень активності (0-5)">
            <input
              v-model.number="checkForm.activityLevel"
              type="number"
              min="0"
              max="5"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </FormField>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <FormField label="% поїдання">
            <input
              v-model.number="checkForm.consumptionPercent"
              type="number"
              min="0"
              max="100"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="0-100"
            />
          </FormField>

          <FormField label="Витрата (грами)">
            <input
              v-model.number="checkForm.consumptionGrams"
              type="number"
              min="0"
              step="0.1"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </FormField>

          <FormField label="Тип шкідника">
            <select
              v-model="checkForm.pestType"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Не визначено</option>
              <option value="rodent">Гризуни</option>
              <option value="insect">Комахи</option>
              <option value="cockroach">Таргани</option>
              <option value="ant">Мурахи</option>
              <option value="fly">Мухи</option>
              <option value="other">Інше</option>
            </select>
          </FormField>
        </div>

        <FormField label="Стан обладнання">
          <select
            v-model="checkForm.equipmentStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="good">Добрий</option>
            <option value="damaged">Пошкоджений</option>
            <option value="missing">Відсутній</option>
            <option value="needs_replacement">Потребує заміни</option>
          </select>
        </FormField>

        <FormField label="Коригувальна дія">
          <textarea
            v-model="checkForm.correctiveAction"
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            placeholder="Заміна приманки, переміщення, ремонт..."
          />
        </FormField>

        <FormField label="Нотатки">
          <textarea
            v-model="checkForm.notes"
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          />
        </FormField>

        <FormField label="Фото">
          <div class="flex flex-wrap gap-2 mb-2">
            <div v-for="(photo, idx) in checkForm.photos" :key="idx" class="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
              <img :src="photo" class="w-full h-full object-cover" />
              <button
                type="button"
                class="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                @click="removePhoto(idx)"
              >x</button>
            </div>
          </div>
          <label class="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Додати фото
            <input type="file" accept="image/*" multiple class="hidden" @change="onPhotoSelect" />
          </label>
        </FormField>
      </form>

      <template #footer>
        <button
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          @click="showCheckForm = false"
        >
          Скасувати
        </button>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
          @click="submitCheck"
        >
          Зберегти перевірку
        </button>
      </template>
    </BaseModal>

    <PointFormModal
      :show="showEdit"
      :point="point"
      @close="showEdit = false"
      @save="onSave"
    />

    <ConfirmDialog
      :show="showDelete"
      title="Видалити точку"
      :message="`Видалити точку №${point.number}?`"
      confirm-label="Видалити"
      confirm-variant="danger"
      @confirm="onDelete"
      @cancel="showDelete = false"
    />
  </div>

  <div v-else class="text-center py-12">
    <p class="text-gray-500">Точку не знайдено</p>
  </div>
</template>
