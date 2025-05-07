<template>
  <div>
    <h1>Connect Your Spotify Account</h1>
    <button @click="linkSpotify" :disabled="loading">
      {{ loading ? '…Redirecting' : 'Connect with Spotify' }}
    </button>
    <p v-if="error" class="error">{{ error.message }}</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  requiresAuth: false
})

import { ref } from 'vue'
import { useSupabaseClient } from '@supabase/auth-helpers-nuxt'

const supabase = useSupabaseClient()
const loading = ref(false)
const error = ref<Error | null>(null)

async function linkSpotify() {
  loading.value = true
  error.value = null

  const { data, error: err } = await supabase.auth.linkIdentity({
    provider: 'spotify',
    options: {
      scopes: 'user-read-email user-read-private'
    }
  })

  if (err) {
    error.value = err
    loading.value = false
  }
  // On success, the browser is redirected to Spotify’s consent screen.
}
</script>

<style scoped>
button {
  padding: .5rem 1rem;
  font-size: 1rem;
  background-color: #1db954;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
  cursor: default;
}
.error {
  margin-top: .5rem;
  color: red;
}
</style>
