<template>
</template>

<script setup lang="ts">
definePageMeta({
  requiresAuth: true
})

const router = useRouter()

//da odma izbaci welcome page umjesto prazne stranice, i dalje redirecta na login ako user nije prijavljen
onMounted(() => {
  router.replace('/welcome') 
})
</script>
