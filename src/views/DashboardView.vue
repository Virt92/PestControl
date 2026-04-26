<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="card in cards"
        :key="card.label"
        class="bg-white rounded-xl border border-slate-200 p-5 shadow-soft"
      >
        <p class="text-sm text-slate-500">{{ card.label }}</p>
        <p class="text-2xl font-bold text-slate-800 mt-1">{{ card.value }}</p>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-soft">
      <h3 class="font-semibold text-slate-700 mb-4">Останні виїзди</h3>
      <p class="text-sm text-slate-400">Поки немає даних. Додайте клієнтів та об'єкти для початку роботи.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const cards = [
  { label: 'Клієнти', value: '0' },
  { label: "Об'єкти", value: '0' },
  { label: 'Активні виїзди', value: '0' },
  { label: 'Моніторингові точки', value: '0' }
]
</script>
