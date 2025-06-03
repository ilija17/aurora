<template>
  <div class="container py-24 text-center space-y-4">
    <h2 class="text-2xl font-bold">Reset your password</h2>
    <input v-model="email" type="email" placeholder="Your email" />
    <button class="btn-primary" @click="sendResetEmail">Send reset link</button>
    <p v-if="message">{{ message }}</p>
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
