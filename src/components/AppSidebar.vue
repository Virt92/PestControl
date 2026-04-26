<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { to: '/', icon: '📊', label: 'Дашборд' },
  { to: '/clients', icon: '👥', label: 'Клієнти' },
  { to: '/objects', icon: '🏢', label: "Об'єкти" },
  { to: '/visits', icon: '🚗', label: 'Виїзди' },
  { to: '/monitoring', icon: '📍', label: 'Моніторинг' },
  { to: '/documents', icon: '📄', label: 'Документи' }
]

const currentPath = computed(() => route.path)
</script>

<template>
  <aside class="w-60 bg-slate-900 text-white flex flex-col shrink-0">
    <div class="p-5 border-b border-slate-700">
      <h1 class="text-lg font-bold tracking-tight">🛡️ PestControl</h1>
      <p class="text-xs text-slate-400 mt-0.5">Management Platform</p>
    </div>

    <nav class="flex-1 py-3">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-5 py-2.5 text-sm transition-colors"
        :class="
          currentPath === item.to
            ? 'bg-brand-600/20 text-brand-300 font-medium'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        "
      >
        <span class="text-base">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="p-4 border-t border-slate-700 text-xs text-slate-500">
      v0.1.0 MVP
    </div>
  </aside>
</template>
