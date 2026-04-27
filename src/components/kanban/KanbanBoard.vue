<script setup lang="ts">
import StatusBadge from '@/components/ui/StatusBadge.vue'

export interface KanbanItem {
  id: string
  title: string
  subtitle: string
  status: string
  date?: string
}

export interface KanbanColumn {
  key: string
  label: string
  color: string
  items: KanbanItem[]
}

defineProps<{ columns: KanbanColumn[] }>()
const emit = defineEmits<{ 'item-click': [item: KanbanItem] }>()
</script>

<template>
  <div class="flex gap-4 overflow-x-auto pb-4">
    <div
      v-for="col in columns"
      :key="col.key"
      class="flex-shrink-0 w-72 bg-gray-50 rounded-xl"
    >
      <div class="px-4 py-3 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-700">{{ col.label }}</h3>
          <span
            class="text-xs font-medium px-2 py-0.5 rounded-full"
            :class="`bg-${col.color}-100 text-${col.color}-700`"
          >
            {{ col.items.length }}
          </span>
        </div>
      </div>
      <div class="p-3 space-y-2 min-h-[200px] max-h-[600px] overflow-y-auto">
        <div
          v-for="item in col.items"
          :key="item.id"
          class="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow"
          @click="emit('item-click', item)"
        >
          <p class="text-sm font-medium text-gray-900 truncate">{{ item.title }}</p>
          <p class="text-xs text-gray-500 mt-1 truncate">{{ item.subtitle }}</p>
          <div class="flex items-center justify-between mt-2">
            <StatusBadge :status="item.status" />
            <span v-if="item.date" class="text-xs text-gray-400">{{ item.date }}</span>
          </div>
        </div>
        <div v-if="col.items.length === 0" class="text-center py-8 text-xs text-gray-400">
          Порожньо
        </div>
      </div>
    </div>
  </div>
</template>
