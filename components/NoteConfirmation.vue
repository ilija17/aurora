<template>
  <div class="space-y-4">
    <textarea
      rows="5"
      v-model="notes"
      placeholder="Enter some notes…"
      class="w-full p-3 rounded-lg resize-y bg-[var(--input-bg)] text-[var(--input-color)] border border-[var(--input-border)]"
    ></textarea>
    <button
      :disabled="isSubmitting"
      @click="submit"
      class="px-4 py-2 rounded-lg bg-[var(--primary)] text-white disabled:opacity-50"
    >
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
  spotifySongName: string | null
  spotifySongArtist: string | null
}>()

const notes = ref('')
const isSubmitting = ref(false)

const { seal, hasKek, unlock } = useDek()

async function submit() {
  isSubmitting.value = true
  try {
    const payload = {
      general_mood: props.selectedMood,
      detailed_ids: props.detailedMoodContext,
      location_ids: props.locationContext,
      social_ids: props.socialContext,
      notes: notes.value,
      spotify_song_id: props.spotifySongId,
      spotify_song_name: props.spotifySongName,
      spotify_song_artist: props.spotifySongArtist
    }

    const { enc_iv, enc_blob } = await seal(payload)

    await $fetch('/api/mood-entry', {
      method: 'POST',
      body: {
        ciphertext: enc_blob,
        iv: enc_iv
      }
    })

    // 700 hydradtion errora za sekundu
    await router.push('/calendar')
  } catch (err: any) {
    console.error('Failed to submit:', err)
    
    // ako fali kek dobij password
    if (err.message.includes('No cached KEK')) {
      const pwd = prompt('Please enter your password to encrypt this entry:')
      if (pwd) {
        try {
          await unlock(pwd)
          return submit()
        } catch (unlockErr: any) {
          alert(`Failed to unlock: ${unlockErr.message}`)
        }
      } else {
        alert('Password is required to encrypt the entry')
      }
    } else {
      alert(`Failed to submit entry: ${err.message}`)
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>