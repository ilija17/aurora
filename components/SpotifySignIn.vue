<template>
  <div>
    <button v-if="!user" @click="loginWithSpotify">Login with Spotify</button>
    <div v-else>Welcome, {{ user.email }}</div>
  </div>
</template>

<script setup lang="ts">
import { useSupabaseClient, useSupabaseUser } from '#imports'
const supabase = useSupabaseClient()
const user     = useSupabaseUser()

async function loginWithSpotify() {
  await supabase.auth.signInWithOAuth({
    provider: 'spotify',
    options: { redirectTo: 'https://aurora.ilijabosnjak.com/' }
  })
}
</script>
