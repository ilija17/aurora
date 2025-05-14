<template>
  <div class="grid place-items-center h-screen">
    <div>
      <h2>Reset your password</h2><br>
      <input v-model="email" type="email" placeholder="Your email" /><br><br>
      <button @click="sendResetEmail">Send reset link</button><br>
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
