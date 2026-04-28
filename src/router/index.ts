import { createRouter, createWebHashHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'
import { getToken } from '@/services/api'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { title: 'Вхід', public: true }
    },
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
    },
    {
      path: '/plans',
      name: 'plans',
      component: () => import('@/views/ServicePlansView.vue'),
      meta: { title: 'Плани обслуговування' }
    },
    {
      path: '/inspections',
      name: 'inspections',
      component: () => import('@/views/InspectionsView.vue'),
      meta: { title: 'Обстеження' }
    },
    {
      path: '/portal',
      name: 'portal',
      component: () => import('@/views/ClientPortalView.vue'),
      meta: { title: 'Клієнтський кабінет' }
    }
  ]
})

router.beforeEach((to) => {
  const title = (to.meta.title as string) ?? 'PestControl'
  document.title = `${title} — PestControl`

  if (!to.meta.public && !getToken()) {
    return { name: 'login' }
  }
})
