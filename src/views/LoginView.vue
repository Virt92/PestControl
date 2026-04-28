<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const isRegister = ref(false)
const email = ref('')
const password = ref('')
const fullName = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    if (isRegister.value) {
      await auth.register(email.value, password.value, fullName.value, 'admin')
    } else {
      await auth.login(email.value, password.value)
    }
    router.push('/')
  } catch (e: any) {
    error.value = e.message || 'Помилка авторизації'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-green-700">🐛 PestControl</h1>
        <p class="text-gray-500 mt-1">Система управління pest control</p>
      </div>

      <h2 class="text-xl font-semibold mb-4">
        {{ isRegister ? 'Реєстрація' : 'Вхід' }}
      </h2>

      <div v-if="error" class="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
        {{ error }}
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div v-if="isRegister">
          <label class="block text-sm font-medium text-gray-700 mb-1">Повне ім'я</label>
          <input
            v-model="fullName"
            type="text"
            required
            class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Іван Петренко"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Мінімум 6 символів"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
        >
          {{ loading ? 'Зачекайте...' : (isRegister ? 'Зареєструватися' : 'Увійти') }}
        </button>
      </form>

      <div class="mt-4 text-center text-sm text-gray-500">
        <button @click="isRegister = !isRegister" class="text-green-600 hover:underline">
          {{ isRegister ? 'Вже є акаунт? Увійти' : 'Немає акаунта? Зареєструватися' }}
        </button>
      </div>
    </div>
  </div>
</template>
