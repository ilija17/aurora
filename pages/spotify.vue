<template>
  <div class="dashboard">
    <h1>My Spotify Top 10</h1>

    <!-- Show login button if not authenticated -->
    <button
      v-if="tracksError?.statusCode === 401"
      @click="login"
      class="login-btn"
    >
      Log in with Spotify
    </button>

    <!-- Once authenticated, show two columns -->
    <div v-else class="columns">
      <!-- Top Tracks Column -->
      <section class="column">
        <h2>Top Tracks</h2>
        <ul class="list">
          <li v-for="t in tracks" :key="t.id" class="item">
            <img
              :src="t.album.images[2]?.url"
              alt="Album art"
            />
            <div class="info">
              <strong>{{ t.name }}</strong>
              <p>{{ t.artists.map(a => a.name).join(', ') }}</p>
            </div>
          </li>
        </ul>
      </section>

      <!-- Top Artists Column -->
      <section class="column">
        <h2>Top Artists</h2>
        <ul class="list">
          <li v-for="a in artists" :key="a.id" class="item">
            <img
              :src="a.images[2]?.url"
              alt="Artist image"
            />
            <div class="info">
              <strong>{{ a.name }}</strong>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
// Fetch top 10 tracks and artists
const { data: tracks, error: tracksError } = await useFetch<any[]>('/api/spotify/top-tracks?limit=10')
const { data: artists }               = await useFetch<any[]>('/api/spotify/top-artists?limit=10')

// Redirect to login if needed
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
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
}
.login-btn:hover {
  opacity: 0.9;
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
  margin-left: 0.75rem;
}
</style>
