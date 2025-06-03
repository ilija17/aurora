<template>
  <div class="rounded-xl p-6 max-w-xs" style="background-color: var(--secondary)">
    <ul v-if="detailedMoods.length">
      <!-- highlight selected items -->
      <button 
        @click="toggleDetail(opt.id)"
        style="margin: 5px; padding: 10px;"
        v-for="opt in detailedMoods" :key="opt.id"
        :style="{
          backgroundColor: selectedDetails.includes(opt.id) ? 'var(--accent)' : 'var(--primary)',
          color:           'var(--fg)',
          borderColor:     !selectedDetails.includes(opt.id) ? 'var(--accent)' : 'var(--border)',
        }"
        >
        
        {{ opt.mood_name }}
      </button>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'

const props = defineProps<{ 
  selectedMood: number 
  modelSelectedDetails: number[]
}>()

const detailedMoods = ref<{ id: number; mood_name: string }[]>([])
const selectedDetails = ref<number[]>([])

const supabase = useSupabaseClient()
const user     = useSupabaseUser()

const emit = defineEmits<{
  (e: 'update:modelSelectedDetails', v: number[]): void
}>()

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
      detailedMoods.value = []
    } else {
      detailedMoods.value = data || []
    }
  },
  { immediate: true }
)

function toggleDetail(id: number) {
  const i = selectedDetails.value.indexOf(id)
  if (i === -1) selectedDetails.value.push(id)
  else            selectedDetails.value.splice(i, 1)
  emit('update:modelSelectedDetails', selectedDetails.value)
}
</script>
