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

const props = defineProps<{
  selectedMood:         number
  detailedMoodContext:  number[]
  locationContext:      number[]
  socialContext:        number[]
  spotifySongId:        string|null
}>()

const notes = ref('')
const isSubmitting = ref(false)

async function submit() {
  isSubmitting.value = true
  try {
    const result = await $fetch('/api/mood-entry', {
      method: 'POST',
      body: {
        selectedMood:        props.selectedMood,
        detailedMoodContext: props.detailedMoodContext,
        locationContext:     props.locationContext,
        socialContext:       props.socialContext,
        notes:               notes.value,
        spotifySongId:       props.spotifySongId
      }
    })

    console.log('New entry created:', result[0].entry_id)
  } catch (err: any) {
    console.error('Insert failed:', err.statusMessage || err.message)
  } finally {
    isSubmitting.value = false
  }
}
</script>
