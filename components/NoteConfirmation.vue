<template>
  <div>
    <textarea
      rows="5"
      cols="80"
      v-model="notes"
      placeholder="Enter some notes…"
    ></textarea>
    <button :disabled="isSubmitting" @click="submit">
      {{ isSubmitting ? 'Submitting…' : 'Submit' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDek } from '~/composables/useDek'
import { useSupabaseClient } from '#imports'

const router = useRouter()
const sb = useSupabaseClient()

const props = defineProps<{
  selectedMood: number
  detailedMoodContext: number[]
  locationContext: number[]
  socialContext: number[]
  spotifySongId: string | null
}>()

const notes = ref('')
const isSubmitting = ref(false)

const { unlock, seal, unlocked } = useDek()

async function submit() {
  isSubmitting.value = true

  try {
    await unlock()
    if (!unlocked.value) throw new Error('Could not unlock encryption key')

    const payload = {
      general_mood: props.selectedMood,
      detailed_ids: props.detailedMoodContext,
      location_ids: props.locationContext,
      social_ids: props.socialContext,
      notes: notes.value,
      spotify_song_id: props.spotifySongId
    }

    const { enc_iv, enc_blob } = await seal(payload)

    await $fetch('/api/mood-entry', {
      method: 'POST',
      body: { 
        ciphertext: enc_blob,
        iv: enc_iv
      }
    })

    await router.push('/mood-calendar-test')
  } catch (err: any) {
    console.error('Failed to submit:', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>
