<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  icon?: string
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo'
}>()

const bgMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  red: 'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600',
  indigo: 'bg-indigo-50 text-indigo-600'
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
    <div
      v-if="icon"
      :class="['w-12 h-12 rounded-lg flex items-center justify-center text-xl', bgMap[color || 'blue']]"
    >
      {{ icon }}
    </div>
    <div>
      <p class="text-sm text-gray-500">{{ title }}</p>
      <p class="text-2xl font-bold text-gray-900">{{ value }}</p>
    </div>
  </div>
</template>
