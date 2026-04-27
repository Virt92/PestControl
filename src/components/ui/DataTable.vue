<script setup lang="ts">
defineProps<{
  columns: { key: string; label: string; width?: string }[]
  rows: Record<string, unknown>[]
  emptyText?: string
}>()

defineEmits<{
  rowClick: [row: Record<string, unknown>]
}>()
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-gray-200">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :style="col.width ? { width: col.width } : {}"
            class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr
          v-for="(row, idx) in rows"
          :key="idx"
          class="hover:bg-gray-50 cursor-pointer transition-colors"
          @click="$emit('rowClick', row)"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-3 text-sm text-gray-700 whitespace-nowrap"
          >
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] ?? '—' }}
            </slot>
          </td>
        </tr>
        <tr v-if="rows.length === 0">
          <td :colspan="columns.length" class="px-4 py-8 text-center text-gray-400 text-sm">
            {{ emptyText || 'Немає даних' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
