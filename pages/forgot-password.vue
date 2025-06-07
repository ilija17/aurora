<template>
  <section class="min-h-screen flex items-center justify-center px-4">
    <div
      class="max-w-md w-full space-y-4 bg-[var(--secondary)] p-6 sm:p-8 rounded-3xl shadow-2xl"
    >
      <h2 class="text-2xl font-bold text-center">Reset your password</h2>
      <FormInput
        id="email"
        label="Email"
        type="email"
        v-model="email"
        placeholder="Your email"
      />
      <button @click="sendResetEmail" class="btn w-full">Send reset link</button>
      <p class="text-sm text-[var(--muted)]">
        Resetting the password without knowing the old one will make existing
        encrypted data unreadable.
      </p>
      <p v-if="message">{{ message }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  requiresAuth: false
})

import { ref } from 'vue'
import { useRuntimeConfig, useSupabaseClient } from '#imports'
import FormInput from '~/components/FormInput.vue'

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
