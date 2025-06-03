<script setup lang="ts">
definePageMeta({
  requiresAuth: false
})

const user = useSupabaseUser()
const redirectInfo = useSupabaseCookieRedirect()

watch(user, () => {
  if (user.value) {
    const path = redirectInfo.pluck()
    return navigateTo(path || '/') 
  }
}, { immediate: true })
</script>

<template>
  <div class="container py-24 text-center">
    Waiting for login...
  </div>
</template>
