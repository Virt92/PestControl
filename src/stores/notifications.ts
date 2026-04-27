import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Notification, AuditLogEntry, NotificationType } from '@/types'

const NOTIF_KEY = 'pc_notifications'
const AUDIT_KEY = 'pc_audit_log'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function loadNotifications(): Notification[] {
  const raw = localStorage.getItem(NOTIF_KEY)
  return raw ? JSON.parse(raw) as Notification[] : []
}

function saveNotifications(items: Notification[]) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(items))
}

function loadAuditLog(): AuditLogEntry[] {
  const raw = localStorage.getItem(AUDIT_KEY)
  return raw ? JSON.parse(raw) as AuditLogEntry[] : []
}

function saveAuditLog(items: AuditLogEntry[]) {
  localStorage.setItem(AUDIT_KEY, JSON.stringify(items))
}

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>(loadNotifications())
  const auditLog = ref<AuditLogEntry[]>(loadAuditLog())

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
  const unread = computed(() => notifications.value.filter(n => !n.read).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ))

  function addNotification(data: Omit<Notification, 'id' | 'read' | 'createdAt'>) {
    const notif: Notification = {
      ...data,
      id: generateId(),
      read: false,
      createdAt: new Date().toISOString()
    }
    notifications.value.unshift(notif)
    saveNotifications(notifications.value)
    return notif
  }

  function markAsRead(id: string) {
    const notif = notifications.value.find(n => n.id === id)
    if (notif) {
      notif.read = true
      saveNotifications(notifications.value)
    }
  }

  function markAllAsRead() {
    notifications.value.forEach(n => { n.read = true })
    saveNotifications(notifications.value)
  }

  function logAction(data: Omit<AuditLogEntry, 'id' | 'createdAt'>) {
    const entry: AuditLogEntry = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    auditLog.value.unshift(entry)
    saveAuditLog(auditLog.value)
    return entry
  }

  function getAuditLogForEntity(entity: string, entityId: string): AuditLogEntry[] {
    return auditLog.value.filter(e => e.entity === entity && e.entityId === entityId)
  }

  function searchNotifications(type?: NotificationType): Notification[] {
    if (!type) return notifications.value
    return notifications.value.filter(n => n.type === type)
  }

  return {
    notifications, auditLog, unreadCount, unread,
    addNotification, markAsRead, markAllAsRead,
    logAction, getAuditLogForEntity, searchNotifications
  }
})
