<script setup lang="ts">
const props = defineProps<{
  status: string
  variant?: 'default' | 'dot'
}>()

const colorMap: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-600',
  suspended: 'bg-yellow-100 text-yellow-800',
  triggered: 'bg-red-100 text-red-800',
  maintenance: 'bg-orange-100 text-orange-800',
  planned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600',
  draft: 'bg-yellow-100 text-yellow-800',
  ready: 'bg-blue-100 text-blue-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-600',
  paused: 'bg-orange-100 text-orange-800',
  info: 'bg-blue-100 text-blue-800',
  warning: 'bg-yellow-100 text-yellow-800',
  critical: 'bg-red-100 text-red-800',
  task: 'bg-purple-100 text-purple-800'
}

const dotColorMap: Record<string, string> = {
  active: 'bg-green-500',
  inactive: 'bg-gray-400',
  triggered: 'bg-red-500',
  maintenance: 'bg-orange-500',
  planned: 'bg-blue-500',
  in_progress: 'bg-indigo-500',
  completed: 'bg-green-500',
  cancelled: 'bg-gray-400'
}

const labelMap: Record<string, string> = {
  active: 'Активний',
  inactive: 'Неактивний',
  suspended: 'Призупинено',
  triggered: 'Спрацювала',
  maintenance: 'Обслуговування',
  planned: 'Заплановано',
  in_progress: 'В роботі',
  completed: 'Завершено',
  cancelled: 'Скасовано',
  draft: 'Чернетка',
  ready: 'Готовий',
  published: 'Опублікований',
  archived: 'Архів',
  paused: 'Призупинено',
  b2b: 'B2B',
  b2c: 'B2C'
}
</script>

<template>
  <span
    v-if="variant === 'dot'"
    class="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700"
  >
    <span :class="['w-2 h-2 rounded-full', dotColorMap[status] || 'bg-gray-400']" />
    {{ labelMap[status] || status }}
  </span>
  <span
    v-else
    :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', colorMap[status] || 'bg-gray-100 text-gray-600']"
  >
    {{ labelMap[status] || status }}
  </span>
</template>
