<template>
  <footer class="border-t border-[var(--border)] bg-[var(--secondary)] text-[var(--muted)]">
    <div class="max-w-screen-xl mx-auto px-4 py-6 flex flex-col items-center space-y-2">
      <p
        class="text-sm cursor-pointer select-none"
        @click="handleClick"
      >
        © figma figma on the wall
      </p>
      <img
        v-if="showFigma"
        :src="figmaUrl"
        alt="Figma"
        class="w-16 h-auto"
      />
      <nav class="flex space-x-4 text-sm">
        <NuxtLink to="/welcome" class="hover:text-[var(--fg)] transition-colors">Home</NuxtLink>
        <NuxtLink to="/settings" class="hover:text-[var(--fg)] transition-colors">Settings</NuxtLink>
        <a href="https://github.com" target="_blank" class="hover:text-[var(--fg)] transition-colors">GitHub</a>
      </nav>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import figmaUrl from '@/assets/images/figma.png'

const showFigma = ref(false)
let clickCount = 0
let lastClick = 0

function handleClick() {
  const now = Date.now()
  if (now - lastClick < 500) {
    clickCount++
  } else {
    clickCount = 1
  }
  lastClick = now

  if (clickCount >= 5) {
    showFigma.value = true
  }
}
</script>

<style scoped>
a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
