<template>
  <div v-if="user">
    <h2>Welcome, {{ user.email }}</h2>
    <button @click="logout">Logout</button>
  </div>

  <div v-else>
    <p>Redirecting to login...</p>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

watch(user, () => {
  if (!user.value) {
    navigateTo('/login')
  }
}, { immediate: true })

const logout = async () => {
  await supabase.auth.signOut()
}
</script>
