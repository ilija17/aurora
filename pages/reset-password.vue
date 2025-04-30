<template>
  <div class="grid place-items-center h-screen">
    <div>
      <h2>Set a new password</h2>
      <input v-model="password" type="password" placeholder="New password" />
      <button @click="updatePassword">Update password</button>
      <p v-if="message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  requiresAuth: false
})

const supabase = useSupabaseClient()
const password = ref('')
const message = ref('')
const user = useSupabaseUser()

const updatePassword = async () => {
  if (!password.value) {
    message.value = 'Please enter a new password'
    return
  }

  const { data, error } = await supabase.auth.updateUser({
    password: password.value,
  })

  if (error) {
    message.value = error.message
  } else {
    message.value = 'Password updated! You can now log in.'
    // Optional: Redirect to login
    setTimeout(() => navigateTo('/login'), 2000)
  }
}
</script>
