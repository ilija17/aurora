<template>
  <div class="page-container text-center">
    <a href="/api/spotify/login" class="btn">
      Connect with Spotify
    </a>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  requiresAuth: false
})
</script>

