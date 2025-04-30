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
        <DetailedMood
          :selectedMood="selectedMood"
          v-model:modelSelectedDetails="selectedDetails"
        />
      </div>

      <!-- slide 3: location / company -->
      <div class="flex-shrink-0 w-full p-4">
        <AdditionalContext
          v-model:modelValueLocations="selectedLocations"
          v-model:modelValueSocials="selectedSocials"
        />
      </div>

      <!-- slide 4: Confirmation -->
      <div class="flex-shrink-0 w-full p-4">
        <NoteConfirmation
          :selectedMood="selectedMood"
          :detailedMoodContext="selectedDetails"
          :locationContext="selectedLocations"
          :socialContext="selectedSocials"
        />
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
      :disabled="current === 3 || (current === 0 && selectedMood === 0)"
    >
      ›
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import MoodSelector from '~/components/MoodSelector.vue'
import DetailedMood from './DetailedMood.vue'

const slides = 4

// track slide number
const current = ref(0)

// mood selector great/fine/awful...
const selectedMood = ref(0)
const selectedLocations = ref<number[]>([])
const selectedSocials   = ref<number[]>([])
const selectedDetails   = ref<number[]>([])

const isFirstSlide = computed(() => current.value === 0)
const isLastSlide  = computed(() => current.value === slides - 1)
const nextDisabled = computed(() =>
  isLastSlide.value ||
  (isFirstSlide.value && selectedMood.value === 0)
)

function next() {
  if (!nextDisabled.value) {
    current.value++
  }
}

function prev() {
  if (current.value > 0) current.value--
}

watch(selectedMood, () => current.value = 0)
</script>