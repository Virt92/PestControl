<script setup lang="ts">
import { ref, watch } from 'vue'
import { generateQRDataUrl } from '@/utils/qr'

const props = defineProps<{ tagId: string; size?: number }>()
const qrUrl = ref('')

watch(() => props.tagId, async (val) => {
  if (val) qrUrl.value = await generateQRDataUrl(val, props.size ?? 160)
}, { immediate: true })
</script>

<template>
  <div class="inline-flex flex-col items-center gap-2">
    <img v-if="qrUrl" :src="qrUrl" :alt="`QR: ${tagId}`" class="rounded border border-gray-200" />
    <span class="text-xs font-mono text-gray-500">{{ tagId }}</span>
  </div>
</template>
