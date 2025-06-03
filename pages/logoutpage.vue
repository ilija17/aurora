<template>
  <div v-if="user">
    <HelloUser />
    <button @click="logout">
      Logout
    </button>
  </div>
  <div v-else>
    <p>Redirecting to login…</p>
  </div>
</template>

<script setup lang="ts">
import { useDek } from '~/composables/useDek'
import { useSupabaseClient } from '#imports'
import { clearSalt } from '~/utils/cryptoHelpers'

definePageMeta({
  requiresAuth: true
})

const supabase = useSupabaseClient()
const user     = useSupabaseUser()

watch(user, val => {
  if (!val) navigateTo('/login')
}, { immediate: true })

const logout = async () => {
  await supabase.auth.signOut()
  clearSession()
  navigateTo('/login')
}
</script>

<style scoped>

</style>