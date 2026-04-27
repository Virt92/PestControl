<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ 'upload': [dataUrl: string] }>()
const dragOver = ref(false)

function handleFile(file: File) {
  if (!file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    if (result) emit('upload', result)
  }
  reader.readAsDataURL(file)
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file) handleFile(file)
}

function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) handleFile(file)
}
</script>

<template>
  <div
    class="border-2 border-dashed rounded-xl p-8 text-center transition-colors"
    :class="dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'"
    @dragover.prevent="dragOver = true"
    @dragleave="dragOver = false"
    @drop.prevent="onDrop"
  >
    <svg class="mx-auto w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    <p class="text-sm text-gray-600 mb-2">Перетягніть зображення плану або</p>
    <label class="inline-block px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100">
      Виберіть файл
      <input type="file" accept="image/*" class="hidden" @change="onFileSelect" />
    </label>
    <p class="text-xs text-gray-400 mt-2">PNG, JPG, SVG</p>
  </div>
</template>
