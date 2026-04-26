<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const pageTitle = computed(() => (route.meta.title as string) ?? 'PestControl')
</script>

<template>
  <header class="h-14 px-6 flex items-center justify-between border-b border-slate-200 bg-white shrink-0">
    <h2 class="text-lg font-semibold text-slate-800">{{ pageTitle }}</h2>
    <div class="flex items-center gap-3">
      <span class="text-sm text-slate-500">Адмін</span>
    </div>
  </header>
</template>
