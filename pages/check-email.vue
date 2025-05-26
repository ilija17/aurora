<template>
  <div>
    <div>
      <div class="grid h-screen place-items-center">
        Check your email for a confirmation link.
        <p class="mt-2 text-gray-600">
          If you don't see it, check your spam folder or try again.
        </p>

        <button
          @click="$router.push('/login')"
          style="margin: 5px; padding: 10px;"
        >
          {{ "Go to login" }}
        </button>
      </div>
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