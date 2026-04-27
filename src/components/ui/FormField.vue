<script setup lang="ts">
defineProps<{
  label: string
  error?: string
  required?: boolean
}>()
</script>

<template>
  <div class="space-y-1">
    <label class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <slot />
    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
  </div>
</template>
