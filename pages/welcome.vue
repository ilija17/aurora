<!-- Improved welcome page design -->
<template>
  <section class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-2xl space-y-6 bg-[var(--secondary)] p-6 sm:p-8 rounded-3xl shadow-2xl">
      <HelloUser />
      <p class="text-center text-lg text-[var(--muted)]">
        Log your mood and let
        <span
          @click="handleAuroraClick"
          class="cursor-pointer select-none"
        >
          Aurora
        </span>
        give you insights about your day.
      </p>
      <Moods />
    </div>

    <div
      v-if="showSupa"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div class="relative">
        <img :src="supaUrl" alt="supavijest" class="max-w-full max-h-full rounded-lg shadow-lg" />
        <button
          @click="showSupa = false"
          class="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import supaUrl from '@/assets/images/supavijest.png'

const showSupa = ref(false)
let clickCount = 0
let lastClick = 0

function handleAuroraClick() {
  const now = Date.now()
  if (now - lastClick < 500) {
    clickCount++
  } else {
    clickCount = 1
  }
  lastClick = now

  if (clickCount >= 5) {
    showSupa.value = true
  }
}
</script>
