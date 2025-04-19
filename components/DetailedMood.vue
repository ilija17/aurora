<template>
  <div>
    <ul v-if="detailedMoods.length">
      <li v-for="opt in detailedMoods" :key="opt.id">
        {{ opt.mood_name }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'

const props = defineProps<{ selectedMood: number }>()
const detailedMoods = ref<{ id: number; mood_name: string }[]>([])
const supabase = useSupabaseClient()
const user     = useSupabaseUser()

watch(
  () => props.selectedMood,
  async (newTypeId) => {
    if (!newTypeId || !user.value) {
      detailedMoods.value = []
      return
    }

    if(newTypeId === 1 || newTypeId === 2){
      newTypeId = 1
    } else if (newTypeId === 3 ) {
      newTypeId = 2
    } else if (newTypeId === 4 || newTypeId === 5){
      newTypeId = 3
    }

    const { data, error } = await supabase
      .from('detailed_moods')
      .select('id, mood_name')
      .eq('type_id', newTypeId)

    if (error) {
      console.error('error loading detailed moods:', error)
      detailedMoods.value = []
    } else {
      detailedMoods.value = data || []
    }
  },
  { immediate: true }
)
</script>
