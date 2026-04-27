<script setup lang="ts">
import BaseModal from './BaseModal.vue'

defineProps<{
  show: boolean
  title: string
  message: string
  confirmLabel?: string
  confirmVariant?: 'danger' | 'primary'
}>()

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <BaseModal :show="show" :title="title" size="sm" @close="$emit('cancel')">
    <p class="text-sm text-gray-600">{{ message }}</p>
    <template #footer>
      <button
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        @click="$emit('cancel')"
      >
        Скасувати
      </button>
      <button
        :class="[
          'px-4 py-2 text-sm font-medium text-white rounded-lg',
          confirmVariant === 'danger'
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-blue-600 hover:bg-blue-700'
        ]"
        @click="$emit('confirm')"
      >
        {{ confirmLabel || 'Підтвердити' }}
      </button>
    </template>
  </BaseModal>
</template>
