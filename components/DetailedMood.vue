<template>
  <div>
    <FormInput
      id="number"
      label="Number"
      type="number"
      v-model="number"
      placeholder="5"
    />

    <button @click="callMoods">
      Load detailed moods
    </button>

    <ul v-if="detailedMoods.length">
      <li v-for="opt in detailedMoods" :key="opt.id">
        {{ opt.mood_name }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'

const number = ref('')
const detailedMoods = ref<Array<{ id: number; mood_name: string }>>([])

const supabase = useSupabaseClient()
const user     = useSupabaseUser()

async function callMoods() {
  if (!user.value) return

  const { data, error } = await supabase
    .from('detailed_moods')
    .select('id, mood_name')
    .eq('type_id', Number(number.value))

  if (error) {
    console.error('error loading detailed moods:', error)
  } else {
    detailedMoods.value = data || []
    console.log('detailedMoods:', detailedMoods.value)
  }
}
</script>
