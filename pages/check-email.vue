<template>
  <section class="min-h-screen flex items-center justify-center px-4">
    <div
      class="max-w-md w-full text-center space-y-6 bg-[var(--secondary)] p-6 sm:p-8 rounded-3xl shadow-2xl"
    >
      <h1 class="text-2xl font-bold">Check your inbox</h1>
      <p class="text-[var(--muted)]">
        If you don't see the confirmation email, check your spam folder or try again.
      </p>
      <button @click="$router.push('/login')" class="btn w-full">Go to login</button>
    </div>
  </section>
</template>

<script lang="ts" setup>
definePageMeta({
  requiresAuth: false
})
</script>
