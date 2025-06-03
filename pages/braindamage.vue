<template>
  <div>
    <h1>All Mood Entries (Decrypted)</h1>
    
    <!-- Debug info -->
    <div class="debug-info">
      <p>Has KEK: {{ hasKek }}</p>
      <p>Unlocked: {{ unlocked }}</p>
      <button @click="forceUnlock">Force Unlock with Password</button>
    </div>
    
    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
    <div v-else-if="decrypted.length">
      <div v-for="e in decrypted" :key="e.id" class="entry">
        <h2>Entry {{ e.id }}</h2>
        <div v-if="e.error" class="decrypt-error">
          <strong>Decryption failed:</strong> {{ e.error }}
        </div>
        <pre v-else>{{ e.payload }}</pre>
      </div>
    </div>
    <div v-else-if="loading">Loading…</div>
    <div v-else>No mood entries found</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'
import { useDek } from '~/composables/useDek'

interface RawRow {
  id: number
  iv: string
  data: string
}

const supabase = useSupabaseClient()
const { open, unlock, hasKek, unlocked } = useDek()

const decrypted = ref<Array<{ id: number; payload?: any; error?: string }>>([])
const errorMsg = ref('')
const loading = ref(true)

async function forceUnlock() {
  const pwd = prompt('Enter your password:')
  if (pwd) {
    try {
      await unlock(pwd)
      loadEntries()
    } catch (e: any) {
      errorMsg.value = `Unlock failed: ${e.message}`
    }
  }
}

async function loadEntries() {
  try {
    loading.value = true
    errorMsg.value = ''

    const { data, error } = await supabase
      .from('mood_entries')
      .select('id, iv, data')
      .order('id', { ascending: false })

    if (error) throw new Error(error.message)

    if (!data || data.length === 0) {
      decrypted.value = []
      return
    }

    console.log(`[DEBUG] Found ${data.length} entries to decrypt`)
    console.log('[DEBUG] Sample entry:', data[0])

    decrypted.value = await Promise.all(
      data.map(async (row: RawRow) => {
        try {
          console.log(`[DEBUG] Decrypting entry ${row.id}`)
          console.log(`[DEBUG] IV: ${row.iv?.slice(0, 16)}...`)
          console.log(`[DEBUG] Data: ${row.data?.slice(0, 32)}...`)
          
          const payload = await open({
            enc_iv: row.iv,
            enc_blob: row.data
          })
          
          console.log(`[DEBUG] Successfully decrypted entry ${row.id}`)
          return { id: row.id, payload }
        } catch (decryptError: any) {
          console.error(`[DEBUG] Failed to decrypt entry ${row.id}:`, decryptError)
          return { 
            id: row.id, 
            error: `Decryption failed: ${decryptError.message}` 
          }
        }
      })
    )

  } catch (e: any) {
    console.error('Failed to load entries:', e)
    errorMsg.value = e.message || String(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadEntries()
})
</script>

<style scoped>
.error {
  color: red;
  margin: 1em 0;
}

.decrypt-error {
  color: orange;
  background: black;
  border: 1px solid #ffeaa7;
  padding: 0.5em;
  border-radius: 4px;
}

.debug-info {
  background: black;
  padding: 1em;
  margin-bottom: 1em;
  border-radius: 4px;
}

.entry {
  border: 1px solid #ccc;
  padding: 1em;
  margin-bottom: 1em;
  border-radius: 4px;
}

pre {
  background: #f5f5f5;
  color: #333;
  padding: 0.5em;
  overflow-x: auto;
  border-radius: 4px;
}
</style>