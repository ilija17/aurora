<template>
  <div class="bg-[#2a2a3b] p-6 rounded-lg">
    <div class="mb-6 flex items-center justify-between">
      <span class="text-lg font-medium">Local LLM only</span>
      <input type="checkbox" class="toggle" />
    </div>

    <div class="space-y-4">
      <button class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Export data</button>
      <button class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete account</button>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'settings'
});
</script>