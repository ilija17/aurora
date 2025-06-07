<template>
  <section class="min-h-screen flex items-center justify-center px-4">
    <div
      class="max-w-md w-full space-y-4 bg-[var(--secondary)] p-6 sm:p-8 rounded-3xl shadow-2xl"
    >
      <h2 class="text-2xl font-bold text-center">Set a new password</h2>

      <FormInput
        id="password"
        label="Password"
        type="password"
        v-model="password"
        placeholder="••••••••"
      />

      <FormInput
        id="confirm-password"
        label="Confirm Password"
        type="password"
        v-model="confirmPassword"
        placeholder="••••••••"
      />

      <p
        v-if="confirmPassword && confirmPassword !== password"
        class="text-red-600 text-sm"
      >
        Passwords do not match
      </p>

      <div class="text-sm">
        <p>Strength: {{ strengthText }}</p>
        <p v-if="strengthFeedback" class="mt-1">{{ strengthFeedback }}</p>
      </div>

      <button
        class="btn w-full disabled:opacity-50"
        @click="updatePassword"
        :disabled="
          submitting || passwordScore < 3 || confirmPassword !== password || !password
        "
      >
        Update password
      </button>
      <p v-if="errorMsg" class="mt-2 text-red-600">{{ errorMsg }}</p>
      <p v-if="message">{{ message }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import zxcvbn from 'zxcvbn'
import { useDek } from '~/composables/useDek'
import { useDekRepair } from '~/composables/useDekRepair'

definePageMeta({
  requiresAuth: false
})

const supabase = useSupabaseClient()
const password = ref('')
const confirmPassword = ref('')
const message = ref('')
const user = useSupabaseUser()

const errorMsg = ref('')
const submitting = ref(false)

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
  errorMsg.value = ''

  if (passwordScore.value < 3) {
    errorMsg.value = 'Please choose a stronger password.'
    return
  }

  if (confirmPassword.value !== password.value) {
    errorMsg.value = 'Passwords do not match'
    return
  }

  if (!password.value) {
    message.value = 'Please enter a new password'
    return
  }

  submitting.value = true
  try {
    const { error } = await supabase.auth.updateUser({
      password: password.value,
    })

    errorMsg.value = ''

    if (error) {
      message.value = error.message
      return
    }

    const { updateDekPassword } = useDek()
    const { repairIfMissing } = useDekRepair()

    try {
      await updateDekPassword(password.value, { suppressRedirect: true })
    } catch (e) {
      try {
        await repairIfMissing(password.value, null, null)
        const userId = user.value?.id
        if (userId) {
          await supabase.from('mood_entries').delete().eq('user_id', userId)
          await supabase.from('diary_entries').delete().eq('user_id', userId)
        }
      } catch (e2) {
        console.error('Failed to reset encryption keys', e2)
      }
    }

    message.value = 'Password updated! You can now log in.'
    setTimeout(() => navigateTo('/login'), 2000)
    password.value = ''
    confirmPassword.value = ''
  } finally {
    submitting.value = false
  }
}
</script>
