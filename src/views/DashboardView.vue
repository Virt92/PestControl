<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useClientsStore } from '@/stores/clients'
import { useObjectsStore } from '@/stores/objects'
import { useVisitsStore } from '@/stores/visits'
import { useMonitoringStore } from '@/stores/monitoring'
import { useDocumentsStore } from '@/stores/documents'
import { useNotificationsStore } from '@/stores/notifications'
import { VISIT_TYPE_LABELS } from '@/types'
import type { VisitType } from '@/types'
import StatCard from '@/components/ui/StatCard.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const router = useRouter()
const clientsStore = useClientsStore()
const objectsStore = useObjectsStore()
const visitsStore = useVisitsStore()
const monitoringStore = useMonitoringStore()
const documentsStore = useDocumentsStore()
const notificationsStore = useNotificationsStore()

const recentVisits = computed(() => {
  return [...visitsStore.visits]
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    .slice(0, 5)
    .map(v => ({
      ...v,
      objectName: objectsStore.getById(v.objectId)?.name ?? '—',
      clientName: clientsStore.getById(v.clientId)?.companyName ?? '—'
    }))
})

const overdueVisits = computed(() => {
  const now = new Date()
  return visitsStore.visits.filter(v =>
    v.status === 'planned' && new Date(v.scheduledAt) < now
  ).length
})

const recentNotifications = computed(() => {
  return notificationsStore.unread.slice(0, 5)
})

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Дашборд</h1>
      <p class="text-sm text-gray-500 mt-1">Операційний контроль pest control</p>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Клієнтів"
        :value="clientsStore.activeClients.length"
        icon="👥"
        color="blue"
      />
      <StatCard
        title="Об'єктів"
        :value="objectsStore.activeObjects.length"
        icon="🏢"
        color="green"
      />
      <StatCard
        title="Точок моніт."
        :value="monitoringStore.activePoints.length"
        icon="📍"
        color="purple"
      />
      <StatCard
        title="Спрацювань"
        :value="monitoringStore.triggeredPoints.length"
        icon="🔴"
        color="red"
      />
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Виїздів (акт.)"
        :value="visitsStore.activeVisits.length"
        icon="🚗"
        color="indigo"
      />
      <StatCard
        title="Прострочених"
        :value="overdueVisits"
        icon="⏰"
        color="yellow"
      />
      <StatCard
        title="Документів"
        :value="documentsStore.documents.length"
        icon="📄"
        color="blue"
      />
      <StatCard
        title="Повідомлень"
        :value="notificationsStore.unreadCount"
        icon="🔔"
        color="red"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Visits -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-semibold text-gray-500 uppercase">Останні виїзди</h2>
          <button
            class="text-xs text-blue-600 hover:text-blue-800"
            @click="router.push({ name: 'visits' })"
          >
            Всі виїзди →
          </button>
        </div>
        <div v-if="recentVisits.length === 0" class="text-center py-6 text-sm text-gray-400">
          Виїздів ще немає
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="v in recentVisits"
            :key="v.id"
            class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            @click="router.push({ name: 'visit-detail', params: { id: v.id } })"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ v.objectName }}</p>
              <p class="text-xs text-gray-500">
                {{ v.clientName }} · {{ VISIT_TYPE_LABELS[v.type as VisitType] }} · {{ formatDate(v.scheduledAt) }}
              </p>
            </div>
            <StatusBadge :status="v.status" />
          </div>
        </div>
      </div>

      <!-- Notifications -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-semibold text-gray-500 uppercase">Повідомлення</h2>
          <button
            class="text-xs text-blue-600 hover:text-blue-800"
            @click="router.push({ name: 'notifications' })"
          >
            Всі повідомлення →
          </button>
        </div>
        <div v-if="recentNotifications.length === 0" class="text-center py-6 text-sm text-gray-400">
          Нових повідомлень немає
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="n in recentNotifications"
            :key="n.id"
            class="p-3 rounded-lg bg-gray-50"
          >
            <div class="flex items-center gap-2 mb-1">
              <StatusBadge :status="n.type" />
              <span class="text-xs text-gray-400">{{ formatDate(n.createdAt) }}</span>
            </div>
            <p class="text-sm font-medium text-gray-900">{{ n.title }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ n.message }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
