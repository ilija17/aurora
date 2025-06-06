<template>
  <div class="center">
    <input v-model="q" @keyup.enter="doSearch" placeholder="Search…" />
    <button @click="doSearch">▶️</button>

    <div v-if="localSelectedId" class="preview">
      <iframe
        :src="`https://open.spotify.com/embed/track/${localSelectedId}`"
        width="300"
        height="80"
        frameborder="0"
        allowtransparency="true"
        allow="encrypted-media"
      ></iframe>
    </div>

    <ul>
      <li
        v-for="t in tracks"
        :key="t.id"
        :class="['item', { selected: t.id === localSelectedId }]"
        @click="onTrackClick(t)"
      >
        {{ t.name }} — {{ t.artists.map(a => a.name).join(', ') }}
      </li>
    </ul>

    <div v-if="localSelectedId" class="actions">
      <button @click="onContinue">Select</button>
    </div>

    <p v-if="displayedId" class="song-id">
      Selected Song ID: <code>{{ displayedId }}</code>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  spotifySongId: string | null
  spotifySongName: string | null
  spotifySongArtist: string | null
}>()

const emit = defineEmits<{
  (e: 'update:spotifySongId', value: string | null): void
  (e: 'update:spotifySongName', value: string | null): void
  (e: 'update:spotifySongArtist', value: string | null): void
}>()

const q               = ref('')
const tracks          = ref<any[]>([])
const localSelectedId = ref<string | null>(props.spotifySongId)
const localSelectedName = ref<string | null>(props.spotifySongName)
const localSelectedArtist = ref<string | null>(props.spotifySongArtist)
const displayedId     = ref<string | null>(null)

watch(() => props.spotifySongId, v => {
  localSelectedId.value = v
})
watch(() => props.spotifySongName, v => {
  localSelectedName.value = v
})
watch(() => props.spotifySongArtist, v => {
  localSelectedArtist.value = v
})

async function doSearch() {
  localSelectedId.value = null
  displayedId.value     = null
  tracks.value          = []

  if (!q.value) {
    return
  }

  try {
    tracks.value = await $fetch('/api/spotify/search', {
      params: { query: q.value }
    })
  } catch (err: any) {
    if (err.statusCode === 401) {
      window.location.href = '/api/spotify/login'
    } else {
    }
  }
}


function onTrackClick(track: any) {
  localSelectedId.value = track.id
  localSelectedName.value = track.name
  localSelectedArtist.value = track.artists.map((a: any) => a.name).join(', ')
  displayedId.value     = null
}

function onContinue() {
  displayedId.value = localSelectedId.value
  emit('update:spotifySongId', localSelectedId.value)
  emit('update:spotifySongName', localSelectedName.value)
  emit('update:spotifySongArtist', localSelectedArtist.value)
}
</script>

<style scoped>
.center {
  max-width: 400px;
  margin: 4rem auto;
  text-align: center;
}

.preview {
  margin: 1.5rem 0;
  text-align: center;
}

.preview iframe {
  display: inline-block;
}

.item {
  cursor: pointer;
  margin: .5rem 0;
}

.item.selected {
  background: green;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

</style>
