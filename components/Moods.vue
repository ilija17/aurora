<template>
  <div class="relative w-full max-w-md mx-auto overflow-hidden">
    <!-- Slides wrapper -->
    <div
      class="flex transition-transform duration-500 ease-in-out"
      :style="{ transform: `translateX(-${current * 100}%)` }"
    >
      <!-- 1) high‐level mood -->
      <div class="flex-shrink-0 w-full p-4">
        <MoodSelector v-model="selectedMood" @next="next" />
      </div>

      <!-- 2) detailed mood -->
      <div class="flex-shrink-0 w-full p-4">
        <DetailedMood
          :selectedMood="selectedMood"
          v-model:modelSelectedDetails="selectedDetails"
        />
      </div>

      <!-- 3) locations & socials -->
      <div class="flex-shrink-0 w-full p-4">
        <AdditionalContext
          v-model:modelValueLocations="selectedLocations"
          v-model:modelValueSocials="selectedSocials"
        />
      </div>

      <!-- 4) Spotify search -->
      <div class="flex-shrink-0 w-full p-4">
        <SpotifySearch
          v-model:spotifySongId="songId"
        />
      </div>

      <!-- 5) confirmation / submit -->
      <div class="flex-shrink-0 w-full p-4">
        <NoteConfirmation
          :selectedMood="selectedMood"
          :detailedMoodContext="selectedDetails"
          :locationContext="selectedLocations"
          :socialContext="selectedSocials"
          :spotifySongId="songId"
        />
      </div>
    </div>

    <!-- navigation -->
    <button @click="prev" :disabled="current === 0">‹</button>
    <button
      @click="next"
      :disabled="current === slides - 1 || (current === 0 && selectedMood === 0)"
    >
      ›
    </button>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import MoodSelector from '~/components/MoodSelector.vue'
  import DetailedMood from '~/components/DetailedMood.vue'
  import AdditionalContext from '~/components/AdditionalContext.vue'
  import SpotifySearch from '~/components/SpotifySearch.vue'
  import NoteConfirmation from '~/components/NoteConfirmation.vue'

  const slides = 5
  const current = ref(0)

  const selectedMood      = ref(0)
  const selectedDetails   = ref<number[]>([])
  const selectedLocations = ref<number[]>([])
  const selectedSocials   = ref<number[]>([])
  const songId            = ref<string|null>(null)

  const isFirst = computed(() => current.value === 0)
  const isLast  = computed(() => current.value === slides - 1)
  const nextDisabled = computed(() =>
    isLast.value || (isFirst.value && selectedMood.value === 0)
  )

  function next() {
    if (!nextDisabled.value) current.value++
  }

  function prev() {
    if (current.value > 0) current.value--
  }

  watch(selectedMood, () => {
    current.value = 0
  })
</script>
