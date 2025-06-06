<template>
<nav class="bg-transparent text-white px-6 py-4 flex items-center justify-between" aria-label="Main menu">
  <!-- Mobile Layout -->
  <div class="flex md:hidden items-center justify-between w-full">
    <!-- Left: Logo + Hamburger -->
    <div class="flex items-center space-x-3">
      <!-- Hamburger Menu -->
      <div class="flex-col items-center p-2 text-white hover:bg-[var(--highlighted)] rounded-lg transition bg-transparent border-none outline-none pb-0">
        <button
          @click="showMobileMenu = true"
          class="clear-style"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-menu-2">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M4 6l16 0" />
                <path d="M4 12l16 0" />
                <path d="M4 18l16 0" />
              </svg>
        </button>
      </div>

      <!-- Logo -->
      <NuxtLink
        to="/welcome"
        class="rounded-full flex items-center justify-center"
      >
        <svg  xmlns="http://www.w3.org/2000/svg"  width="48"  height="48"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="1"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-rocket"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3" /><path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3" /><path d="M15 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /></svg>
      </NuxtLink>
    </div>

    <!-- Right: Profile Dropdown -->
    <div class="relative">
      <div class="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors duration-200" @click="toggleDropdown">
        <svg class="w-7 h-7 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>
      
      <!-- Profile Dropdown Menu -->
      <div v-if="showDropdown" class="absolute right-0 mt-2 w-48 bg-[var(--secondary)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden z-50">
        <NuxtLink to="/settings" class="block px-4 py-3 text-left text-sm text-white hover:bg-[var(--highlighted)] transition-colors duration-200">
          Settings
        </NuxtLink>
        <div
          @click="logout"
          class="w-full text-left px-4 py-3 text-sm text-white hover:bg-[var(--highlighted)] transition-colors duration-200 flex items-center justify-between cursor-pointer"
        >
          Log out
          <svg xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="text-[var(--muted)] icon icon-tabler icons-tabler-outline icon-tabler-logout"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" /><path d="M9 12h12l-3 -3" /><path d="M18 15l3 -3" /></svg>
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile Menu Overlay -->
  <div 
    v-if="showMobileMenu"
    class="md:hidden fixed inset-0 z-50 flex"
  >
    <!-- Backdrop -->
    <div 
      @click="showMobileMenu = false"
      class="fixed inset-0 bg-black/50"
    ></div>
    
    <!-- Sidebar -->
    <aside class="relative w-80 bg-[var(--secondary)] shadow-xl flex flex-col overflow-hidden animate-slide-in-left">
      <!-- Menu Content -->
      <div class="flex flex-col p-4 space-y-4">
        <!-- Top row: Calendar and Spotify -->
        <div class="flex items-center pb-2 border-b border-[var(--border)]">
          <div
            @click="showMobileMenu = false"
            class="p-3 text-white hover:bg-[var(--highlighted)] rounded-lg transition"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-menu-2">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M4 6l16 0" />
                <path d="M4 12l16 0" />
                <path d="M4 18l16 0" />
              </svg>
          </div>
          <NuxtLink 
            to="/calendar" 
            @click="showMobileMenu = false"
            class="flex items-center justify-center p-3 rounded-xl hover:bg-gray-600 transition-colors duration-200"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </NuxtLink>
          <NuxtLink
            to="/spotify"
            @click="showMobileMenu = false"
            class="flex items-center justify-center p-3 rounded-xl hover:bg-gray-600 transition-colors duration-200"
          >
            <svg style="fill:#1DB954" xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="currentColor"  class="icon icon-tabler icons-tabler-filled icon-tabler-brand-spotify"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -15 8.66l.005 -.324a10 10 0 0 1 14.995 -8.336m-2.168 11.605c-1.285 -1.927 -4.354 -2.132 -6.387 -.777a1 1 0 0 0 1.11 1.664c1.195 -.797 3.014 -.675 3.613 .223a1 1 0 1 0 1.664 -1.11m1.268 -3.245c-2.469 -1.852 -5.895 -2.187 -8.608 -.589a1 1 0 0 0 1.016 1.724c1.986 -1.171 4.544 -.92 6.392 .465a1 1 0 0 0 1.2 -1.6m1.43 -3.048c-3.677 -2.298 -7.766 -2.152 -10.977 -.546a1 1 0 0 0 .894 1.788c2.635 -1.317 5.997 -1.437 9.023 .454a1 1 0 1 0 1.06 -1.696" /></svg>
          </NuxtLink>
          
        </div>

        <!-- Navigation Links -->
        <div class="space-y-2">
          <NuxtLink 
            to="/welcome" 
            @click="showMobileMenu = false"
            class="flex items-center space-x-3 p-3 text-white hover:bg-[var(--highlighted)] rounded-lg transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-rocket"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3" /><path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3" /><path d="M15 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /></svg>
            <span class="text-lg font-semibold">Home</span>
          </NuxtLink>
          
          <NuxtLink 
            to="/llm" 
            @click="showMobileMenu = false"
            class="flex items-center space-x-3 p-3 text-white hover:bg-[var(--highlighted)] rounded-lg transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span class="text-lg font-semibold">AI chat</span>
          </NuxtLink>
          
          <NuxtLink 
            to="/diary" 
            @click="showMobileMenu = false"
            class="flex items-center space-x-3 p-3 text-white hover:bg-[var(--highlighted)] rounded-lg transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            <span class="text-lg font-semibold">Diary</span>
          </NuxtLink>
        </div>
      </div>
    </aside>
  </div>

  <!-- Desktop Layout (unchanged) -->
  <div class="hidden md:flex items-center justify-between w-full">
    <!-- Left section: Logo, App Name, and Navigation Links -->
    <div class="flex items-center space-x-8">
      <!-- Logo/Brand -->
      <div class="flex items-center space-x-3">
        <NuxtLink
          to="/welcome"
          class="rounded-full flex items-center justify-center"
        >
          <svg  xmlns="http://www.w3.org/2000/svg"  width="48"  height="48"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="1"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-rocket"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3" /><path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3" /><path d="M15 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /></svg>
        </NuxtLink>
        <NuxtLink
          to="/welcome"
          class="text-xl font-semibold nav-link text-white duration-200 no-underline"
        >
          Home
        </NuxtLink>
      </div>
    </div>

    <!-- Right Side Actions -->
    <div class="flex items-center space-x-4">
      <NuxtLink to="/llm" class="text-md font-semibold nav-link text-white duration-200 no-underline">
        AI chat
      </NuxtLink>
      <NuxtLink to="/diary" class="text-md font-semibold nav-link text-white duration-200 no-underline">
        Diary
      </NuxtLink>
      <NuxtLink to="/calendar" class="text-sm font-semibold nav-link text-white duration-200 no-underline">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </NuxtLink>
      <NuxtLink
        to="/spotify"
        class="text-sm font-semibold nav-link no-underline"
      >
        <svg style="fill:#1DB954" xmlns="http://www.w3.org/2000/svg"  width="30"  height="30"  viewBox="0 0 24 24"  fill="currentColor"  class="icon icon-tabler icons-tabler-filled icon-tabler-brand-spotify"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -15 8.66l.005 -.324a10 10 0 0 1 14.995 -8.336m-2.168 11.605c-1.285 -1.927 -4.354 -2.132 -6.387 -.777a1 1 0 0 0 1.11 1.664c1.195 -.797 3.014 -.675 3.613 .223a1 1 0 1 0 1.664 -1.11m1.268 -3.245c-2.469 -1.852 -5.895 -2.187 -8.608 -.589a1 1 0 0 0 1.016 1.724c1.986 -1.171 4.544 -.92 6.392 .465a1 1 0 0 0 1.2 -1.6m1.43 -3.048c-3.677 -2.298 -7.766 -2.152 -10.977 -.546a1 1 0 0 0 .894 1.788c2.635 -1.317 5.997 -1.437 9.023 .454a1 1 0 1 0 1.06 -1.696" /></svg>
      </NuxtLink>
      <div class="relative">
        <div class="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors duration-200" @click="toggleDropdown">
          <svg class="w-7 h-7 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <!-- Dropdown Menu -->
        <div v-if="showDropdown" class="absolute right-0 mt-2 w-48 bg-[var(--secondary)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden z-50">
          <NuxtLink to="/settings" class="block px-4 py-3 text-left text-sm text-white hover:bg-[var(--highlighted)] transition-colors duration-200">
            Settings
          </NuxtLink>
          <div
            @click="logout"
            class="w-full text-left px-4 py-3 text-sm text-white hover:bg-[var(--highlighted)] transition-colors duration-200 flex items-center justify-between cursor-pointer"
          >
            Log out
            <svg xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="text-[var(--muted)] icon icon-tabler icons-tabler-outline icon-tabler-logout"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" /><path d="M9 12h12l-3 -3" /><path d="M18 15l3 -3" /></svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</nav>
</template>

<script setup>
import { ref } from 'vue'
import { useSupabaseClient } from '#imports'

definePageMeta({
  requiresAuth: true
})

const supabase = useSupabaseClient()

const logout = async () => {
  await supabase.auth.signOut()
  navigateTo('/login')
}

const showDropdown = ref(false)
const showMobileMenu = ref(false)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

// Close dropdowns when clicking outside
const handleClickOutside = (event) => {
  // Check if click is outside profile dropdown
  if (!event.target.closest('.relative')) {
    showDropdown.value = false
  }
  
  // Check if click is outside mobile menu (but not on the hamburger button)
  if (!event.target.closest('aside') && !event.target.closest('button')) {
    showMobileMenu.value = false
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

<style scoped>
/* Override NuxtLink default styling */
a {
  color: inherit !important;
  text-decoration: none !important;
}

/* Ensure all links are white by default */
.nav-link {
  color: white !important;
}

.nav-link:hover {
  color: #d1d5db !important; /* gray-300 */
}

@keyframes slide-in-left {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.animate-slide-in-left {
  animation: slide-in-left 0.3s ease-out;
}

.clear-style {
  all: unset;
  cursor: pointer;
}
</style>