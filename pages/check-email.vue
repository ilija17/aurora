<template>
  <div class="grid place-items-center min-h-screen p-4">
    <div class="page-container text-center space-y-4">
      <p>Check your email for a confirmation link.</p>
      <p class="text-muted">If you don't see it, check your spam folder or try again.</p>
      <button @click="$router.push('/login')" class="btn">Go to login</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  requiresAuth: false
})
</script>


<style>

</style>
