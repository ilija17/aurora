<template>
  <footer class="border-t border-[var(--border)] bg-[var(--secondary)] text-[var(--muted)]">
    <div class="max-w-screen-xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
      <p class="text-sm">© {{ currentYear }} Aurora</p>
      <nav class="flex space-x-4 text-sm">
        <NuxtLink to="/welcome" class="hover:text-[var(--fg)] transition-colors">Home</NuxtLink>
        <NuxtLink to="/settings" class="hover:text-[var(--fg)] transition-colors">Settings</NuxtLink>
        <a href="https://github.com" target="_blank" class="hover:text-[var(--fg)] transition-colors">GitHub</a>
      </nav>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<style scoped>
a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
