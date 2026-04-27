<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications'

const route = useRoute()
const notificationsStore = useNotificationsStore()

const navItems = [
  { to: '/', icon: '📊', label: 'Дашборд', match: '/' },
  { to: '/clients', icon: '👥', label: 'Клієнти', match: '/clients' },
  { to: '/objects', icon: '🏢', label: "Об'єкти", match: '/objects' },
  { to: '/visits', icon: '🚗', label: 'Виїзди', match: '/visits' },
  { to: '/monitoring', icon: '📍', label: 'Моніторинг', match: '/monitoring' },
  { to: '/documents', icon: '📄', label: 'Документи', match: '/documents' },
  { to: '/notifications', icon: '🔔', label: 'Повідомлення', match: '/notifications' }
]

const currentPath = computed(() => route.path)

function isActive(item: { to: string; match: string }): boolean {
  if (item.to === '/') return currentPath.value === '/'
  return currentPath.value.startsWith(item.match)
}
</script>

<template>
  <aside class="w-60 bg-slate-900 text-white flex flex-col shrink-0">
    <div class="p-5 border-b border-slate-700">
      <h1 class="text-lg font-bold tracking-tight">PestControl</h1>
      <p class="text-xs text-slate-400 mt-0.5">Management Platform</p>
    </div>

    <nav class="flex-1 py-3">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-5 py-2.5 text-sm transition-colors"
        :class="
          isActive(item)
            ? 'bg-brand-600/20 text-brand-300 font-medium'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        "
      >
        <span class="text-base">{{ item.icon }}</span>
        <span class="flex-1">{{ item.label }}</span>
        <span
          v-if="item.match === '/notifications' && notificationsStore.unreadCount > 0"
          class="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full min-w-[20px] text-center"
        >
          {{ notificationsStore.unreadCount }}
        </span>
      </router-link>
    </nav>

    <div class="p-4 border-t border-slate-700 text-xs text-slate-500">
      v0.2.0 MVP
    </div>
  </aside>
</template>
