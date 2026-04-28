<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import AppHeader from '@/components/AppHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { useClientsStore } from '@/stores/clients'
import { useObjectsStore } from '@/stores/objects'
import { useVisitsStore } from '@/stores/visits'
import { useMonitoringStore } from '@/stores/monitoring'
import { useDocumentsStore } from '@/stores/documents'
import { useNotificationsStore } from '@/stores/notifications'
import { usePlansStore } from '@/stores/plans'

const route = useRoute()
const auth = useAuthStore()

onMounted(async () => {
  if (auth.isAuthenticated) {
    await loadAllData()
  }
})

async function loadAllData() {
  await Promise.all([
    useClientsStore().fetchAll(),
    useObjectsStore().fetchAll(),
    useVisitsStore().fetchAll(),
    useMonitoringStore().fetchPoints(),
    useMonitoringStore().fetchChecks(),
    useDocumentsStore().fetchAll(),
    useNotificationsStore().fetchAll(),
    useNotificationsStore().fetchAuditLog(),
    usePlansStore().fetchAll(),
  ])
}
</script>

<template>
  <div v-if="route.name === 'login'" class="min-h-screen">
    <router-view />
  </div>
  <div v-else class="min-h-screen flex">
    <AppSidebar />
    <div class="flex-1 flex flex-col min-w-0">
      <AppHeader />
      <main class="flex-1 p-6 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>
