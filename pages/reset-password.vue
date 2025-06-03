<template>
  <div class="grid place-items-center min-h-screen p-4">
    <div class="page-container space-y-4">
      <h2 class="text-xl font-semibold">Set a new password</h2>
      <FormInput
            id="password"
            label="Password"
            type="password"
            v-model="password"
            placeholder="••••••••"
          />

      <div class="text-sm">
        <p>Strength: {{ strengthText }}</p>
        <p v-if="strengthFeedback" class="mt-1">{{ strengthFeedback }}</p>
      </div>
      <p v-if="errorMsg" class="mt-2 text-red-600">{{ errorMsg }}</p>
      <button @click="updatePassword" class="btn">Update password</button>
      <p v-if="message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import zxcvbn from 'zxcvbn'

definePageMeta({
  requiresAuth: false
})

const supabase = useSupabaseClient()
const password = ref('')
const message = ref('')
const user = useSupabaseUser()

const errorMsg = ref('')

const passwordScore    = ref(0)
const strengthText     = ref('')
const strengthFeedback = ref('')

watch(password, (pw) => {
  const { score, feedback } = zxcvbn(pw)
  passwordScore.value = score
  strengthText.value = ['Very weak','Weak','Fair','Good','Strong'][score]
  strengthFeedback.value = feedback.warning || feedback.suggestions.join(' ')
})

const updatePassword = async () => {
  if (passwordScore.value < 3) {
    errorMsg.value = 'Please choose a stronger password.'
    return
  }

  if (!password.value) {
    message.value = 'Please enter a new password'
    return
  }

  const { data, error } = await supabase.auth.updateUser({
    password: password.value,
  })

  errorMsg.value = ''

  if (error) {
    message.value = error.message
  } else {
    message.value = 'Password updated! You can now log in.'
    // Optional: Redirect to login
    setTimeout(() => navigateTo('/login'), 2000)
  }
}
</script>

