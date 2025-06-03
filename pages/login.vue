<template>
  <div class="container py-12">
    <LoginForm />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  requiresAuth: false
})
</script>
