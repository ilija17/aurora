<template>
  <div class="grid place-items-center h-screen">
    <div>
      <h2>Set a new password</h2>
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
      <button @click="updatePassword">Update password</button>
      <p v-if="message">{{ message }}</p>
    </div>
  </div>
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
    return
  }

  const { updateDekPassword } = useDek()
  const { repairIfMissing } = useDekRepair()

  try {
    await updateDekPassword(password.value)
  } catch (e) {
    try {
      await repairIfMissing(password.value, null, null)
      // remove old encrypted data which can't be decrypted anymore
      const userId = user.value?.id
      if (userId) {
        const { data: moodIds } = await supabase
          .from('mood_entries')
          .select('id')
          .eq('user_id', userId)

        const ids = moodIds?.map((row: any) => row.id) || []
        if (ids.length) {
          await supabase
            .from('mood_entries_detailed_moods')
            .delete()
            .in('mood_entry_id', ids)
        }

        await supabase.from('mood_entries').delete().eq('user_id', userId)
        await supabase.from('diary_entries').delete().eq('user_id', userId)
      }
    } catch (e2) {
      console.error('Failed to reset encryption keys', e2)
    }
  }

  message.value = 'Password updated! You can now log in.'
  setTimeout(() => navigateTo('/login'), 2000)
}
</script>
