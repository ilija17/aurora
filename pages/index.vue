<template>
  <div class="container py-24 text-center space-y-6">
    <h1 class="text-4xl font-bold">Welcome to Aurora</h1>
    <p>Your encrypted mood journal with Spotify insights.</p>
    <NuxtLink to="/welcome" class="btn-primary">Get Started</NuxtLink>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  requiresAuth: false
})

</script>
