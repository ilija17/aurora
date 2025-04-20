<template>
  <div>
    <textarea
      rows="5"
      cols="80"
      v-model="title"
      placeholder="Enter some notes…"
    />

    <button @click="test">
      Submit
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'

const title = ref('')

const props = defineProps<{
  selectedMood:         number
  detailedMoodContext:  number[]
  locationContext:      number[]
  socialContext:        number[]
}>()

const supabase = useSupabaseClient()
const user     = useSupabaseUser()

async function test() {
  const { data, error } = await supabase.rpc('insert_mood_entry', {
    p_user_id:       user.value!.id,
    p_general_mood:  props.selectedMood,
    p_detailed_ids:  props.detailedMoodContext,
    p_location_ids:  props.locationContext,
    p_social_ids:    props.socialContext,
    p_notes:         title.value,
  })

  if (error) {
    console.error('Insert failed:', error)
  } else {
    console.log('New entry ID:', data![0].entry_id)
  }
}
</script>
