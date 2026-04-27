<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useVisitsStore } from '@/stores/visits'
import { useObjectsStore } from '@/stores/objects'
import { useClientsStore } from '@/stores/clients'
import type { Visit, VisitStatus, VisitType } from '@/types'
import { VISIT_TYPE_LABELS } from '@/types'
import PageHeader from '@/components/ui/PageHeader.vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import DataTable from '@/components/ui/DataTable.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import VisitFormModal from '@/components/visits/VisitFormModal.vue'
import KanbanBoard from '@/components/kanban/KanbanBoard.vue'
import type { KanbanItem, KanbanColumn } from '@/components/kanban/KanbanBoard.vue'

const router = useRouter()
const visitsStore = useVisitsStore()
const objectsStore = useObjectsStore()
const clientsStore = useClientsStore()

const searchQuery = ref('')
const filterStatus = ref<VisitStatus | ''>('')
const filterType = ref<VisitType | ''>('')
const viewMode = ref<'table' | 'calendar' | 'kanban'>('table')
const showForm = ref(false)
const editingVisit = ref<Visit | null>(null)

const columns = [
  { key: 'scheduledAt', label: 'Дата' },
  { key: 'type', label: 'Тип' },
  { key: 'objectName', label: "Об'єкт" },
  { key: 'clientName', label: 'Клієнт' },
  { key: 'assignedTo', label: 'Виконавець' },
  { key: 'status', label: 'Статус', width: '130px' }
]

const filteredVisits = computed(() => {
  return visitsStore.search(
    searchQuery.value,
    undefined,
    filterStatus.value || undefined,
    filterType.value || undefined
  ).map(v => ({
    ...v,
    objectName: objectsStore.getById(v.objectId)?.name ?? '—',
    clientName: clientsStore.getById(v.clientId)?.companyName ?? '—'
  })).sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
})

const calendarWeeks = computed(() => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const startDay = start.getDay() || 7
  start.setDate(start.getDate() - startDay + 1)

  const weeks: { date: Date; visits: typeof filteredVisits.value }[][] = []
  for (let w = 0; w < 6; w++) {
    const week: { date: Date; visits: typeof filteredVisits.value }[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(start)
      date.setDate(date.getDate() + w * 7 + d)
      const dateStr = date.toISOString().slice(0, 10)
      week.push({
        date,
        visits: filteredVisits.value.filter(v => v.scheduledAt.slice(0, 10) === dateStr)
      })
    }
    weeks.push(week)
  }
  return weeks
})

function openCreate() {
  editingVisit.value = null
  showForm.value = true
}

function onSave(data: Omit<Visit, 'id' | 'createdAt'>) {
  if (editingVisit.value) {
    visitsStore.update(editingVisit.value.id, data)
  } else {
    visitsStore.add(data)
  }
  showForm.value = false
}

function goToDetail(row: Record<string, unknown>) {
  router.push({ name: 'visit-detail', params: { id: row.id as string } })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

function isCurrentMonth(date: Date): boolean {
  const now = new Date()
  return date.getMonth() === now.getMonth()
}

const kanbanColumns = computed<KanbanColumn[]>(() => {
  const statuses: { key: VisitStatus; label: string; color: string }[] = [
    { key: 'planned', label: 'Заплановано', color: 'blue' },
    { key: 'in_progress', label: 'В роботі', color: 'indigo' },
    { key: 'completed', label: 'Завершено', color: 'green' },
    { key: 'cancelled', label: 'Скасовано', color: 'gray' }
  ]
  return statuses.map(s => ({
    key: s.key,
    label: s.label,
    color: s.color,
    items: filteredVisits.value
      .filter(v => v.status === s.key)
      .map(v => ({
        id: v.id,
        title: v.objectName,
        subtitle: `${v.clientName} — ${VISIT_TYPE_LABELS[v.type as VisitType]}`,
        status: v.status,
        date: formatDate(v.scheduledAt)
      }))
  }))
})

function onKanbanItemClick(item: KanbanItem) {
  router.push({ name: 'visit-detail', params: { id: item.id } })
}
</script>

<template>
  <div>
    <PageHeader title="Виїзди" subtitle="Планування та контроль виїздів">
      <template #actions>
        <div class="flex items-center gap-2 bg-gray-100 rounded-lg p-0.5">
          <button
            :class="['px-3 py-1.5 text-xs font-medium rounded-md', viewMode === 'table' ? 'bg-white shadow text-gray-900' : 'text-gray-500']"
            @click="viewMode = 'table'"
          >
            Таблиця
          </button>
          <button
            :class="['px-3 py-1.5 text-xs font-medium rounded-md', viewMode === 'calendar' ? 'bg-white shadow text-gray-900' : 'text-gray-500']"
            @click="viewMode = 'calendar'"
          >
            Календар
          </button>
          <button
            :class="['px-3 py-1.5 text-xs font-medium rounded-md', viewMode === 'kanban' ? 'bg-white shadow text-gray-900' : 'text-gray-500']"
            @click="viewMode = 'kanban'"
          >
            Kanban
          </button>
        </div>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          @click="openCreate"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Запланувати виїзд
        </button>
      </template>
    </PageHeader>

    <div class="flex items-center gap-4 mb-4">
      <div class="flex-1">
        <SearchBar v-model="searchQuery" placeholder="Пошук за виконавцем, нотатками..." />
      </div>
      <select
        v-model="filterType"
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Всі типи</option>
        <option value="inspection">Обстеження</option>
        <option value="treatment">Обробка</option>
        <option value="monitoring_check">Перевірка точок</option>
        <option value="follow_up">Контрольний</option>
      </select>
      <select
        v-model="filterStatus"
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Всі статуси</option>
        <option value="planned">Заплановані</option>
        <option value="in_progress">В роботі</option>
        <option value="completed">Завершені</option>
        <option value="cancelled">Скасовані</option>
      </select>
    </div>

    <div v-if="viewMode === 'table'">
      <DataTable
        :columns="columns"
        :rows="(filteredVisits as unknown as Record<string, unknown>[])"
        empty-text="Виїздів ще немає. Натисніть «Запланувати виїзд»."
        @row-click="goToDetail"
      >
        <template #cell-scheduledAt="{ value }">
          {{ formatDate(value as string) }}
        </template>
        <template #cell-type="{ value }">
          {{ VISIT_TYPE_LABELS[value as VisitType] || value }}
        </template>
        <template #cell-status="{ value }">
          <StatusBadge :status="String(value)" />
        </template>
      </DataTable>
    </div>

    <div v-if="viewMode === 'calendar'" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        <div v-for="day in ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']" :key="day"
          class="px-2 py-2 text-xs font-semibold text-gray-500 text-center"
        >
          {{ day }}
        </div>
      </div>
      <div v-for="(week, wi) in calendarWeeks" :key="wi" class="grid grid-cols-7 border-b border-gray-100 last:border-0">
        <div
          v-for="(cell, di) in week" :key="di"
          :class="[
            'min-h-[80px] p-1.5 border-r border-gray-100 last:border-0',
            !isCurrentMonth(cell.date) ? 'bg-gray-50' : '',
            isToday(cell.date) ? 'bg-blue-50' : ''
          ]"
        >
          <div :class="['text-xs mb-1', isToday(cell.date) ? 'font-bold text-blue-600' : 'text-gray-400']">
            {{ cell.date.getDate() }}
          </div>
          <div
            v-for="v in cell.visits.slice(0, 3)" :key="v.id"
            class="text-xs px-1 py-0.5 mb-0.5 rounded cursor-pointer truncate"
            :class="{
              'bg-blue-100 text-blue-700': v.status === 'planned',
              'bg-indigo-100 text-indigo-700': v.status === 'in_progress',
              'bg-green-100 text-green-700': v.status === 'completed',
              'bg-gray-100 text-gray-500': v.status === 'cancelled'
            }"
            @click="goToDetail(v as unknown as Record<string, unknown>)"
          >
            {{ v.objectName }}
          </div>
          <div v-if="cell.visits.length > 3" class="text-xs text-gray-400">
            +{{ cell.visits.length - 3 }}
          </div>
        </div>
      </div>
    </div>

    <!-- Kanban view -->
    <div v-if="viewMode === 'kanban'">
      <KanbanBoard :columns="kanbanColumns" @item-click="onKanbanItemClick" />
    </div>

    <VisitFormModal
      :show="showForm"
      :visit="editingVisit"
      @close="showForm = false"
      @save="onSave"
    />
  </div>
</template>
