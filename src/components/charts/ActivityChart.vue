<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import type { CheckResult } from '@/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps<{
  checks: CheckResult[]
  title?: string
  months?: number
}>()

const chartData = computed(() => {
  const n = props.months ?? 6
  const now = new Date()
  const labels: string[] = []
  const activityData: number[] = []
  const consumptionData: number[] = []

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    labels.push(d.toLocaleDateString('uk-UA', { month: 'short', year: '2-digit' }))
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1)
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    const monthChecks = props.checks.filter(c => {
      const cd = new Date(c.checkedAt)
      return cd >= monthStart && cd <= monthEnd
    })
    activityData.push(monthChecks.filter(c => c.activity).length)
    const avgConsumption = monthChecks.length > 0
      ? Math.round(monthChecks.reduce((s, c) => s + (c.consumptionPercent ?? 0), 0) / monthChecks.length)
      : 0
    consumptionData.push(avgConsumption)
  }

  return {
    labels,
    datasets: [
      {
        label: 'Випадки активності',
        data: activityData,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.3
      },
      {
        label: 'Середнє % поїдання',
        data: consumptionData,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const },
    title: { display: false }
  },
  scales: {
    y: { beginAtZero: true }
  }
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-5">
    <h3 v-if="title" class="text-sm font-semibold text-gray-500 uppercase mb-4">{{ title }}</h3>
    <div class="h-64">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
