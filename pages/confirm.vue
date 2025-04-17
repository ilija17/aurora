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
  <div>Waiting for login...</div>
</template>
