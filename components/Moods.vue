<template>
  <div class="relative w-full max-w-md mx-auto overflow-hidden pb-16">
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
      <div class="flex-shrink-0 w-full p-4" v-if="isAuthenticated">
        <SpotifySearch
          v-model:spotifySongId="songId"
          v-model:spotifySongName="songName"
          v-model:spotifySongArtist="songArtist"
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
          :spotifySongName="songName"
          :spotifySongArtist="songArtist"
        />
      </div>
    </div>

    <!-- navigation -->
    <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-6 pointer-events-none">
      <button
        @click="prev"
        :disabled="current === 0"
        class="p-2 rounded-full bg-[var(--secondary)] text-[var(--fg)] shadow disabled:opacity-50 pointer-events-auto"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        @click="next"
        :disabled="nextDisabled"
        class="p-2 rounded-full bg-[var(--secondary)] text-[var(--fg)] shadow disabled:opacity-50 pointer-events-auto"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import MoodSelector from '~/components/MoodSelector.vue'
  import DetailedMood from '~/components/DetailedMood.vue'
  import AdditionalContext from '~/components/AdditionalContext.vue'
  import SpotifySearch from '~/components/SpotifySearch.vue'
  import NoteConfirmation from '~/components/NoteConfirmation.vue'
  import { useSpotify } from '~/composables/useSpotify'

  const { isAuthenticated } = useSpotify()

  const baseSlides = 5  
  // ako nije logged in, spotify slide se ne prikazuje
  // i slides se smanjuje za 1
  // možda, al ovo radi pa ono
  const slides = computed(() => baseSlides - (isAuthenticated.value ? 0 : 1))
  const current = ref(0)

  const selectedMood      = ref(0)
  const selectedDetails   = ref<number[]>([])
  const selectedLocations = ref<number[]>([])
  const selectedSocials   = ref<number[]>([])
  const songId            = ref<string|null>(null)
  const songName          = ref<string|null>(null)
  const songArtist        = ref<string|null>(null)

  const isFirst = computed(() => current.value === 0)
  const isLast  = computed(() => current.value === slides.value - 1)
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
