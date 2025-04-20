<template>
  <button @click="loginWithSpotify">
    Sign in with Spotify
  </button>
</template>

<script setup lang="ts">
import { useSupabaseClient } from '#imports'

const supabase = useSupabaseClient()

async function loginWithSpotify() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'spotify'
  })
  if (error) console.error('Spotify sign‑in error:', error)
  // you’ll be redirected to Spotify; on success it comes back to your redirect URI
}
</script>
