<template>
  <div class="page-container text-center space-y-4">
    <h1 class="text-3xl font-bold">Welcome to Aurora</h1>
    <p>Your mood companion app with Spotify integration.</p>
    <NuxtLink to="/login" class="btn">Get started</NuxtLink>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  requiresAuth: false
})

</script>

