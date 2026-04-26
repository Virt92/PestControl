import { createRouter, createWebHashHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { title: 'Дашборд' }
    },
    {
      path: '/clients',
      name: 'clients',
      component: () => import('@/views/ClientsView.vue'),
      meta: { title: 'Клієнти' }
    },
    {
      path: '/objects',
      name: 'objects',
      component: () => import('@/views/ObjectsView.vue'),
      meta: { title: "Об'єкти" }
    },
    {
      path: '/visits',
      name: 'visits',
      component: () => import('@/views/VisitsView.vue'),
      meta: { title: 'Виїзди' }
    },
    {
      path: '/monitoring',
      name: 'monitoring',
      component: () => import('@/views/MonitoringView.vue'),
      meta: { title: 'Моніторинг' }
    },
    {
      path: '/documents',
      name: 'documents',
      component: () => import('@/views/DocumentsView.vue'),
      meta: { title: 'Документи' }
    }
  ]
})

router.beforeEach((to) => {
  const title = (to.meta.title as string) ?? 'PestControl'
  document.title = `${title} — PestControl`
})
