import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Notification, AuditLogEntry, NotificationType } from '@/types'
import { api } from '@/services/api'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const auditLog = ref<AuditLogEntry[]>([])
  const loading = ref(false)

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
  const unread = computed(() => notifications.value.filter(n => !n.read).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ))

  async function fetchAll() {
    loading.value = true
    try {
      notifications.value = await api.get<Notification[]>('/notifications')
    } finally {
      loading.value = false
    }
  }

  async function fetchAuditLog() {
    auditLog.value = await api.get<AuditLogEntry[]>('/audit')
  }

  async function addNotification(data: Omit<Notification, 'id' | 'read' | 'createdAt'>) {
    const notif = await api.post<Notification>('/notifications', { ...data, read: false })
    notifications.value.unshift(notif)
    return notif
  }

  async function markAsRead(id: string) {
    await api.put(`/notifications/${id}/read`, {})
    const notif = notifications.value.find(n => n.id === id)
    if (notif) notif.read = true
  }

  async function markAllAsRead() {
    await api.post('/notifications/read-all')
    notifications.value.forEach(n => { n.read = true })
  }

  function logAction(_data: Omit<AuditLogEntry, 'id' | 'createdAt'>) {
    // audit logging is now handled server-side automatically
  }

  function getAuditLogForEntity(entity: string, entityId: string): AuditLogEntry[] {
    return auditLog.value.filter(e => e.entity === entity && e.entityId === entityId)
  }

  function searchNotifications(type?: NotificationType): Notification[] {
    if (!type) return notifications.value
    return notifications.value.filter(n => n.type === type)
  }

  return {
    notifications, auditLog, loading, unreadCount, unread,
    fetchAll, fetchAuditLog, addNotification, markAsRead, markAllAsRead,
    logAction, getAuditLogForEntity, searchNotifications
  }
})
