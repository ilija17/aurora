<!-- Improved welcome page design -->
<template>
  <section class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-2xl space-y-6 bg-[var(--secondary)] p-8 rounded-3xl shadow-2xl">
      <HelloUser />
      <p class="text-center text-lg text-[var(--muted)]">
        Log your mood and let Aurora give you insights about your day.
      </p>
      <div class="flex justify-center">
        <SpotifySignIn />
      </div>
      <Moods />
    </div>
  </section>
</template>

<script setup lang="ts">
</script>
