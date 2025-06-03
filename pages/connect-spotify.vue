<template>
  <div class="container py-24 text-center">
    <a href="/api/spotify/login" class="btn-primary">Connect with Spotify</a>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  requiresAuth: false
})
</script>
