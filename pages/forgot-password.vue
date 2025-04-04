<template>
  <div>
    <h2>Reset your password</h2>
    <input v-model="email" type="email" placeholder="Your email" />
    <button @click="sendResetEmail">Send reset link</button>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref('')
const message = ref('')

const sendResetEmail = async () => {
  const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: 'http://localhost:3000/reset-password'
  })

  message.value = error ? error.message : 'Check your inbox for a reset link!'
}
</script>