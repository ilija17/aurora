<template>
  <div class="grid place-items-center min-h-screen p-4">
    <div class="page-container text-center space-y-4">
      <h2 class="text-xl font-semibold">Reset your password</h2>
      <input v-model="email" type="email" placeholder="Your email" />
      <button @click="sendResetEmail" class="btn">Send reset link</button>
      <p v-if="message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  requiresAuth: false
})

import { ref } from 'vue'
import { useRuntimeConfig, useSupabaseClient } from '#imports'

const { public: { siteUrl } } = useRuntimeConfig()
const supabase      = useSupabaseClient()
const email         = ref('')
const message       = ref('')

const sendResetEmail = async () => {
  const redirectTo = siteUrl.replace(/\/+$/, '') + '/reset-password'

  const { error } = await supabase.auth
    .resetPasswordForEmail(email.value, { redirectTo })

  message.value = error
    ? error.message
    : 'Check your inbox for a reset link!'
}
</script>

