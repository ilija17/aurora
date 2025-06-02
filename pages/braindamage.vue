<template>
  <div>
    <h1>All Mood Entries (Decrypted)</h1>
    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
    <div v-else-if="finalizedEntries.length">
      <div v-for="e in finalizedEntries" :key="e.id" class="entry">
        <h2>Entry {{ e.id }}</h2>
        <pre>{{ e.payload }}</pre>
      </div>
    </div>
    <div v-else>Loading…</div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useMoodEntries } from '~/composables/useMoodEntries' 

  const errorMsg = ref('')

  const {
    finalizedEntries,         
    fetchFinalizedMoodEntries,
    error,
  } = useMoodEntries()        

  onMounted(async () => {
    try {
      await fetchFinalizedMoodEntries() 
      if (error.value) throw new Error(error.value)
    } catch (e: any) {
      errorMsg.value = e.message || String(e)
      console.error('[MoodCalendar]', e)
    }
  })
</script>

<style scoped>
.error {
  color: red;
  margin: 1em 0;
}
.entry {
  border: 1px solid #ccc;
  padding: 1em;
  margin-bottom: 1em;
}
pre {
  background: black;
  padding: 0.5em;
  overflow-x: auto;
}
</style>
