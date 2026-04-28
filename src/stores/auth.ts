import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, setToken, getToken } from '@/services/api'
import type { UserRole } from '@/types'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: UserRole
}

interface AuthResponse {
  accessToken: string
  user: AuthUser
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(loadUser())
  const isAuthenticated = computed(() => !!user.value && !!getToken())
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isAuditor = computed(() => user.value?.role === 'auditor')
  const isMaster = computed(() => user.value?.role === 'master')
  const isClient = computed(() => user.value?.role === 'client')
  const canManage = computed(() => user.value?.role === 'admin' || user.value?.role === 'auditor')

  function loadUser(): AuthUser | null {
    const raw = localStorage.getItem('pc_user')
    return raw ? JSON.parse(raw) : null
  }

  async function login(email: string, password: string) {
    const res = await api.post<AuthResponse>('/auth/login', { email, password })
    setToken(res.accessToken)
    user.value = res.user
    localStorage.setItem('pc_user', JSON.stringify(res.user))
    return res.user
  }

  async function register(email: string, password: string, fullName: string, role?: string) {
    const res = await api.post<AuthResponse>('/auth/register', { email, password, fullName, role })
    setToken(res.accessToken)
    user.value = res.user
    localStorage.setItem('pc_user', JSON.stringify(res.user))
    return res.user
  }

  function logout() {
    setToken(null)
    user.value = null
    localStorage.removeItem('pc_user')
  }

  async function checkAuth() {
    if (!getToken()) return false
    try {
      const res = await api.get<AuthUser>('/auth/me')
      user.value = { ...user.value!, ...res }
      return true
    } catch {
      logout()
      return false
    }
  }

  return { user, isAuthenticated, isAdmin, isAuditor, isMaster, isClient, canManage, login, register, logout, checkAuth }
})
