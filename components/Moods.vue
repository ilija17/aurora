<template>
  <div class="relative w-full max-w-md mx-auto overflow-hidden">
    <!-- slides Container - probably -->
    <div
      class="flex transition-transform duration-500 ease-in-out"
      :style="{ transform: `translateX(-${current * 100}%)` }"
    >
      <!-- slide 1: MoodSelector, high level -->
      <div class="flex-shrink-0 w-full p-4">
        <MoodSelector v-model="selectedMood" @next="next" />
      </div>

      <!-- slide 2: detaild mood -->
      <div class="flex-shrink-0 w-full p-4">
        <h3 class="text-lg font-medium mb-2">Details for mood {{ selectedMood }}:</h3>
        <ul class="list-disc ml-5">
          <li v-for="opt in detailedOptions" :key="opt.id">{{ opt.mood_name }}</li>
        </ul>
      </div>

      <div class="flex-shrink-0 w-full p-4 text-center">
        <DetailedMood />
      </div>

      <!-- slide 3: Confirmation -->
      <div class="flex-shrink-0 w-full p-4 text-center">
        <p class="mb-4">You selected mood {{ selectedMood }}!</p>
        <button
          @click="reset"
          class="px-4 py-2 bg-green-500 text-white rounded"
        >
          Start Over
        </button>
      </div>
    </div>

    <!-- Prev/Next Buttons -->
    <button
      @click="prev"
      :disabled="current === 0"
    >
      ‹
    </button>
    <button
      @click="next"
      :disabled="current === 2 || (current === 0 && selectedMood === 0)"
    >
      ›
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import MoodSelector from '~/components/MoodSelector.vue'
import { useSupabaseClient, useSupabaseUser, useAsyncData } from '#imports'

// track slide number
const current = ref(0)

// mood selector great/fine/awful...
const selectedMood = ref(0)

const supabase = useSupabaseClient()
const user     = useSupabaseUser()

const { data: detailedOptions } = await useAsyncData(
  () => `details-for-${selectedMood.value}`,
  async () => {
    if (!user.value || selectedMood.value === 0) return []
    const { data } = await supabase
      .from('detailed_moods')
      .select('id, mood_name')
      .eq('type_id', selectedMood.value)
    return data || []
  }
)

function next() {
  if (current.value === 0 && selectedMood.value === 0) return
  if (current.value < 2) current.value++
}

function prev() {
  if (current.value > 0) current.value--
}

function reset() {
  selectedMood.value = 0
  current.value = 0
}

// reset when mood changes
watch(selectedMood, () => current.value = 0)
</script>
