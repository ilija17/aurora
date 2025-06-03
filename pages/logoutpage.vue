<template>
  <div class="page-container text-center" v-if="user">
    <HelloUser />
    <button @click="logout" class="btn mt-4">Logout</button>
  </div>
  <div class="page-container text-center" v-else>
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
  navigateTo('/login')
}
</script>

<style scoped>

</style>
