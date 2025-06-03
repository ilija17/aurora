<template>
  <div class="container py-24 text-center space-y-4">
    <p>Check your email for a confirmation link.</p>
    <p class="text-gray-600">If you don't see it, check your spam folder or try again.</p>
    <button class="btn-primary" @click="$router.push('/login')">
      {{ "Go to login" }}
    </button>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  requiresAuth: false
})
</script>


<style>

</style>