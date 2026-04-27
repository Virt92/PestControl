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
      path: '/clients/:id',
      name: 'client-detail',
      component: () => import('@/views/ClientDetailView.vue'),
      meta: { title: 'Клієнт' }
    },
    {
      path: '/objects',
      name: 'objects',
      component: () => import('@/views/ObjectsView.vue'),
      meta: { title: "Об'єкти" }
    },
    {
      path: '/objects/:id',
      name: 'object-detail',
      component: () => import('@/views/ObjectDetailView.vue'),
      meta: { title: "Об'єкт" }
    },
    {
      path: '/visits',
      name: 'visits',
      component: () => import('@/views/VisitsView.vue'),
      meta: { title: 'Виїзди' }
    },
    {
      path: '/visits/:id',
      name: 'visit-detail',
      component: () => import('@/views/VisitDetailView.vue'),
      meta: { title: 'Виїзд' }
    },
    {
      path: '/monitoring',
      name: 'monitoring',
      component: () => import('@/views/MonitoringView.vue'),
      meta: { title: 'Моніторинг' }
    },
    {
      path: '/monitoring/:id',
      name: 'point-detail',
      component: () => import('@/views/PointDetailView.vue'),
      meta: { title: 'Точка моніторингу' }
    },
    {
      path: '/documents',
      name: 'documents',
      component: () => import('@/views/DocumentsView.vue'),
      meta: { title: 'Документи' }
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('@/views/NotificationsView.vue'),
      meta: { title: 'Повідомлення' }
    }
  ]
})

router.beforeEach((to) => {
  const title = (to.meta.title as string) ?? 'PestControl'
  document.title = `${title} — PestControl`
})
