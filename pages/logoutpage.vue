<template>
  <div v-if="user">
    <HelloUser />

    <button @click="deleteAccount">
      Delete my account
    </button>

    <button @click="logout">
      Logout
    </button>
  </div>
  <div v-else>
    <p>Redirecting to login…</p>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user      = useSupabaseUser()

watch(user, val => {
  if (!val) navigateTo('/login')
}, { immediate: true })

const logout = async () => {
  await supabase.auth.signOut()
  navigateTo('/login')
}

const deleteAccount = async () => {
  try {
    await $fetch('/api/delete-user-self', { method: 'POST' })
    await logout()
  } catch (err: any) {
    console.error(err)
    alert(err.statusMessage || err.message || 'Failed to delete account')
  }
}
</script>

<style scoped>

</style>