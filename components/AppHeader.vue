<template>
<nav class="bg-transparent text-white px-6 py-4 flex items-center justify-between" aria-label="Main menu">
  <!-- Logo/Brand -->
  <div class="flex items-center space-x-3">
    <div class="w-8 h-8 bg-white rounded-full flex items-center justify-center">
      <svg class="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    </div>
    <span class="text-xl font-semibold">Aurora</span>
  </div>

  <!-- Navigation Links -->
  <div class="hidden md:flex items-center space-x-8">
    <NuxtLink
      to="/spotify"
      class="text-white hover:text-gray-300 transition-colors duration-200 text-sm font-medium"
      active-class="text-white border-b-2 border-white pb-1"
      exact-active-class="text-white border-b-2 border-white pb-1"
    >
      Spotify Brainrot
    </NuxtLink>
    <NuxtLink
      to="/welcome"
      class="text-white hover:text-gray-300 transition-colors duration-200 text-sm font-medium"
      active-class="text-white border-b-2 border-white pb-1"
      exact-active-class="text-white border-b-2 border-white pb-1"
    >
      Mood Input
    </NuxtLink>
    <NuxtLink
      to="/llm"
      class="text-white hover:text-gray-300 transition-colors duration-200 text-sm font-medium"
      active-class="text-white border-b-2 border-white pb-1"
      exact-active-class="text-white border-b-2 border-white pb-1"
    >
      Pseudo-psychiatrist
    </NuxtLink>
    <NuxtLink
      to="/diary"
      class="text-white hover:text-gray-300 transition-colors duration-200 text-sm font-medium"
      active-class="text-white border-b-2 border-white pb-1"
      exact-active-class="text-white border-b-2 border-white pb-1"
    >
      Encrypted Diary
    </NuxtLink>
  </div>

  <!-- Right Side Actions -->
  <div class="flex items-center space-x-4">
    <div class="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium cursor-pointer">
      AI chat
    </div>
    <NuxtLink to="/calendar" class="text-gray-300 hover:text-white transition-colors duration-200">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
    </NuxtLink>
    <div class="relative">
      <div class="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors duration-200" @click="toggleDropdown">
        <svg class="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>
      <!-- Dropdown Menu -->
      <div v-if="showDropdown" class="absolute right-0 mt-2 w-48 bg-[var(--secondary)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden z-50">
        <NuxtLink to="/settings" class="block px-4 py-3 text-left text-sm text-white hover:bg-[var(--highlighted)] transition-colors duration-200">
          Settings
        </NuxtLink>
        <NuxtLink to="/logoutpage" class="block px-4 py-3 text-left text-sm text-white hover:bg-[var(--highlighted)] transition-colors duration-200">
          Log out
        </NuxtLink>
      </div>
    </div>
  </div>

  <!-- Mobile Menu Button -->
  <button class="md:hidden text-white hover:text-gray-300 transition-colors duration-200">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  </button>
</nav>
</template>

<script setup>
import { ref } from 'vue'

const showDropdown = ref(false)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showDropdown.value = false
  }
}

// Add event listener for clicking outside
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>