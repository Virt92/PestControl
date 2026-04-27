<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import type { NotificationType } from '@/types'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const notificationsStore = useNotificationsStore()

const activeTab = ref<'notifications' | 'audit'>('notifications')
const filterType = ref<NotificationType | ''>('')

const filteredNotifications = computed(() => {
  const list = filterType.value
    ? notificationsStore.searchNotifications(filterType.value)
    : notificationsStore.notifications
  return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const sortedAuditLog = computed(() => {
  return [...notificationsStore.auditLog].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
})

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('uk-UA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>

<template>
  <div>
    <PageHeader title="Повідомлення" subtitle="Внутрішні повідомлення та журнал подій">
      <template #actions>
        <button
          v-if="notificationsStore.unreadCount > 0"
          class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
          @click="notificationsStore.markAllAsRead()"
        >
          Позначити всі як прочитані
        </button>
      </template>
    </PageHeader>

    <div class="flex gap-4 mb-6 border-b border-gray-200">
      <button
        :class="[
          'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
          activeTab === 'notifications'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        ]"
        @click="activeTab = 'notifications'"
      >
        Повідомлення
        <span
          v-if="notificationsStore.unreadCount > 0"
          class="ml-1 px-1.5 py-0.5 text-xs bg-red-100 text-red-600 rounded-full"
        >
          {{ notificationsStore.unreadCount }}
        </span>
      </button>
      <button
        :class="[
          'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
          activeTab === 'audit'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        ]"
        @click="activeTab = 'audit'"
      >
        Журнал подій
      </button>
    </div>

    <!-- Notifications Tab -->
    <div v-if="activeTab === 'notifications'">
      <div class="flex items-center gap-4 mb-4">
        <select
          v-model="filterType"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Всі типи</option>
          <option value="info">Інформація</option>
          <option value="warning">Попередження</option>
          <option value="critical">Критичне</option>
          <option value="task">Задача</option>
        </select>
      </div>

      <div v-if="filteredNotifications.length === 0" class="text-center py-12 text-gray-400 text-sm">
        Немає повідомлень
      </div>

      <div class="space-y-2">
        <div
          v-for="n in filteredNotifications"
          :key="n.id"
          :class="[
            'p-4 rounded-xl border transition-colors cursor-pointer',
            n.read
              ? 'bg-white border-gray-200'
              : 'bg-blue-50 border-blue-200'
          ]"
          @click="notificationsStore.markAsRead(n.id)"
        >
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center gap-2">
              <StatusBadge :status="n.type" />
              <span class="text-sm font-medium text-gray-900">{{ n.title }}</span>
            </div>
            <span class="text-xs text-gray-400">{{ formatDate(n.createdAt) }}</span>
          </div>
          <p class="text-sm text-gray-600 ml-0">{{ n.message }}</p>
          <p v-if="n.relatedEntity" class="text-xs text-gray-400 mt-1">
            {{ n.relatedEntity }} · {{ n.relatedId }}
          </p>
        </div>
      </div>
    </div>

    <!-- Audit Log Tab -->
    <div v-if="activeTab === 'audit'">
      <div v-if="sortedAuditLog.length === 0" class="text-center py-12 text-gray-400 text-sm">
        Журнал подій порожній
      </div>

      <div class="space-y-1">
        <div
          v-for="entry in sortedAuditLog"
          :key="entry.id"
          class="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg text-sm"
        >
          <span class="text-xs text-gray-400 whitespace-nowrap mt-0.5">{{ formatDate(entry.createdAt) }}</span>
          <div class="flex-1">
            <span class="font-medium text-gray-700">{{ entry.userName }}</span>
            <span class="text-gray-500"> {{ entry.action }} </span>
            <span class="text-gray-700">{{ entry.entity }}</span>
            <p v-if="entry.details" class="text-xs text-gray-400 mt-0.5">{{ entry.details }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
