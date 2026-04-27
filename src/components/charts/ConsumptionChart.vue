<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import type { CheckResult, MonitoringPoint } from '@/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  checks: CheckResult[]
  points: MonitoringPoint[]
  title?: string
}>()

const chartData = computed(() => {
  const baitPoints = props.points.filter(p => p.type === 'bait_station' || p.type === 'feeder')
  const labels = baitPoints.map(p => `№${p.number}`)
  const data = baitPoints.map(p => {
    const pointChecks = props.checks.filter(c => c.pointId === p.id)
    if (pointChecks.length === 0) return 0
    return Math.round(pointChecks.reduce((s, c) => s + (c.consumptionGrams ?? 0), 0))
  })

  return {
    labels,
    datasets: [{
      label: 'Витрата (г)',
      data,
      backgroundColor: data.map(v => v > 100 ? '#ef4444' : v > 50 ? '#f59e0b' : '#22c55e'),
      borderRadius: 4
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false }
  },
  scales: {
    y: { beginAtZero: true, title: { display: true, text: 'грами' } }
  }
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-5">
    <h3 v-if="title" class="text-sm font-semibold text-gray-500 uppercase mb-4">{{ title }}</h3>
    <div class="h-64">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
