<template>
  <!-- dizajn je ass, ovo bi trebalo ići negdje drugdje -->
  <div class="dashboard">
    <select name="timeframe" id="timeframe" v-model="timeframe" @change="" v-if="tracksError?.statusCode !== 401">
      <option value="short_term">Last 4 weeks</option>
      <option value="medium_term">Last 6 months</option>
      <option value="long_term">All time</option>
    </select>
    
    <h1>My Spotify Top 10</h1>
    <button
      v-if="tracksError?.statusCode === 401"
      @click="login"
      class="login-btn"
    >
      Connect with Spotify
    </button>
    <div v-else class="columns">
      <section class="column">
        <h2>Top Tracks</h2>
        <ul class="list">
          <li v-for="t in tracks" :key="t.id" class="item">
            <img :src="t.album.images[2]?.url" alt="Album art" />
            <div class="info">
              <strong>{{ t.name }}</strong>
              <p>{{ t.artists.map(a => a.name).join(', ') }}</p>
            </div>
          </li>
        </ul>
      </section>
      <section class="column">
        <h2>Top Artists</h2>
        <ul class="list">
          <li v-for="a in artists" :key="a.id" class="item">
            <img :src="a.images[2]?.url" alt="Artist image" />
            <div class="info"><strong>{{ a.name }}</strong></div>
          </li>
        </ul>
      </section>
    </div>
    <button v-if="tracksError?.statusCode !== 401" @click="fetchRoast()">Roast me</button>
    <div class="roast">
      <select name="characters" id="characters" @change="" v-model="characters" v-if="tracksError?.statusCode !== 401">
        <option value="Default">Default</option>
        <option value="SlavojZizek">Slavoj Žižek</option>
        <option value="JoeBiden">Joe Biden</option>
        <option value="JeremyClarkson">Jeremy Clarkson</option>
        <option value="SansUndertale">Sans</option>
        <option value="LadyGaga">Lady Gaga</option>
        <option value="Laufey">Laufey</option>
        <option value="Monday">Monday</option>
        <option value="Satoru Gojo"> Satoru Gojo </option>
      </select>

      <p v-if="roastLoad">Generating roast…</p>
      <p v-else-if="roastErr">Couldn’t fetch roast.</p>
      <div v-else v-html="roastHtml"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import MarkdownIt from 'markdown-it'
definePageMeta({ requiresAuth: false })
const md = new MarkdownIt()
const characters = ref('Default')
const timeframe = ref<'short_term' | 'medium_term' | 'long_term'>('short_term')
const { data: tracks, error: tracksError } =
  await useFetch<any[]>(() => `/api/spotify/top-tracks/${timeframe.value}`)
const { data: artists, error: artistsError } =
  await useFetch<any[]>(() => `/api/spotify/top-artists/${timeframe.value}`)

watch(timeframe, async () => {
  try{
    const tr = await $fetch<any[]>(`/api/spotify/top-tracks/${timeframe.value}`)
    tracks.value = tr

    const ar = await $fetch<any[]>(`/api/spotify/top-artists/${timeframe.value}`)
    artists.value = ar
  } catch (e) {
    // ovo ne radi sigurno ali koda errore ikad riješavamo 🚢
    tracksError.value = e
    artistsError.value = e
  }
 })


const roast = ref('')
const roastErr = ref(false)
const roastLoad = ref(false)

async function fetchRoast() {  
  if (!tracks.value.length || !artists.value.length) return
  roastLoad.value = true
  roastErr.value = false
  try {
    const response = await fetch(`/api/openai/roast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tracks: tracks.value,
        artists: artists.value,
        character: characters.value,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch roast')
    }

    const data = await response.json()
    roast.value = data.roast
  } catch (error) {
    roastErr.value = true
  } finally {
    roastLoad.value = false
  }
}

const roastHtml = computed(() => roast.value ? md.render(roast.value) : '')
function login() {
  window.location.href = '/api/spotify/login'
}
</script>

<style scoped>
.dashboard {
  max-width: 900px;
  margin: 2rem auto;
  text-align: center;
}
.login-btn {
  background: #1DB954;
  color: white;
  border: none;
  padding: .75rem 1.5rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
}
.login-btn:hover {
  opacity: .9;
}
.columns {
  display: flex;
  gap: 2rem;
  margin-top: 1.5rem;
}
.column {
  flex: 1;
  text-align: left;
}
.list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}
.item img {
  width: 64px;
  height: 64px;
  border-radius: 4px;
  object-fit: cover;
}
.info {
  margin-left: .75rem;
}
.roast {
  margin-top: 2rem;
}
</style>
