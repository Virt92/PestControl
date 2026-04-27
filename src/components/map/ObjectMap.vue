<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MonitoringPoint } from '@/types'
import { POINT_TYPE_LABELS } from '@/types'

const props = defineProps<{
  floorPlanUrl: string
  points: MonitoringPoint[]
  editable?: boolean
  showHeatmap?: boolean
  heatmapData?: Record<string, number>
}>()

const emit = defineEmits<{
  'point-click': [point: MonitoringPoint]
  'point-move': [pointId: string, x: number, y: number]
  'map-click': [x: number, y: number]
}>()

const mapContainer = ref<HTMLElement>()
const draggingId = ref<string | null>(null)
const hoveredId = ref<string | null>(null)

const statusColors: Record<string, string> = {
  active: '#22c55e',
  inactive: '#9ca3af',
  triggered: '#ef4444',
  maintenance: '#f59e0b'
}

const heatColors = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444']

function getHeatColor(value: number): string {
  const idx = Math.min(Math.floor(value / 20), 4)
  return heatColors[idx]
}

function onMapClick(e: MouseEvent) {
  if (draggingId.value || !props.editable) return
  const rect = mapContainer.value?.getBoundingClientRect()
  if (!rect) return
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  emit('map-click', Math.round(x * 10) / 10, Math.round(y * 10) / 10)
}

function onDragStart(e: MouseEvent, point: MonitoringPoint) {
  if (!props.editable) return
  e.stopPropagation()
  draggingId.value = point.id
  const onMove = (ev: MouseEvent) => {
    const rect = mapContainer.value?.getBoundingClientRect()
    if (!rect) return
    const x = Math.max(0, Math.min(100, ((ev.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((ev.clientY - rect.top) / rect.height) * 100))
    emit('point-move', point.id, Math.round(x * 10) / 10, Math.round(y * 10) / 10)
  }
  const onUp = () => {
    draggingId.value = null
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

const pointsOnMap = computed(() => props.points.filter(p => p.positionX > 0 || p.positionY > 0))
</script>

<template>
  <div class="relative bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
    <div v-if="!floorPlanUrl" class="flex items-center justify-center h-64 text-gray-400 text-sm">
      План об'єкта не завантажено
    </div>

    <div
      v-else
      ref="mapContainer"
      class="relative select-none"
      :class="{ 'cursor-crosshair': editable }"
      @click="onMapClick"
    >
      <img :src="floorPlanUrl" alt="Floor plan" class="w-full h-auto block" draggable="false" />

      <!-- Heatmap layer -->
      <template v-if="showHeatmap && heatmapData">
        <div
          v-for="p in pointsOnMap"
          :key="'heat-' + p.id"
          class="absolute rounded-full opacity-30 pointer-events-none"
          :style="{
            left: `${p.positionX}%`,
            top: `${p.positionY}%`,
            width: '60px',
            height: '60px',
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${getHeatColor(heatmapData[p.id] ?? 0)} 0%, transparent 70%)`
          }"
        />
      </template>

      <!-- Points -->
      <div
        v-for="p in pointsOnMap"
        :key="p.id"
        class="absolute z-10 group"
        :style="{ left: `${p.positionX}%`, top: `${p.positionY}%`, transform: 'translate(-50%, -50%)' }"
        :class="{ 'cursor-move': editable, 'cursor-pointer': !editable }"
        @mousedown="onDragStart($event, p)"
        @click.stop="!editable && emit('point-click', p)"
        @mouseenter="hoveredId = p.id"
        @mouseleave="hoveredId = null"
      >
        <div
          class="w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold"
          :style="{ backgroundColor: statusColors[p.status] || '#6b7280' }"
        >
          {{ p.number }}
        </div>

        <!-- Tooltip -->
        <div
          v-if="hoveredId === p.id"
          class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-20 shadow-lg"
        >
          <div class="font-semibold">Точка №{{ p.number }}</div>
          <div>{{ POINT_TYPE_LABELS[p.type] }} · {{ p.zone || 'без зони' }}</div>
          <div>Поверх: {{ p.floor }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
