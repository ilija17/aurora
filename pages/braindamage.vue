<template>
  <div>
    <h1>All Mood Entries (Decrypted)</h1>
    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
    <div v-else-if="decrypted.length">
      <div v-for="e in decrypted" :key="e.id" class="entry">
        <h2>Entry {{ e.id }}</h2>
        <pre>{{ e.payload }}</pre>
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
const { open, unlock, hasKek } = useDek()

const decrypted = ref<Array<{ id: number; payload: any }>>([])
const errorMsg = ref('')
const loading = ref(true)

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

    decrypted.value = await Promise.all(
      data.map(async (row: RawRow) => {
        const payload = await open({
          enc_iv: row.iv,
          enc_blob: row.data
        })
        return { id: row.id, payload }
      })
    )

  } catch (e: any) {
    console.error('Failed to load entries:', e)
    
    if (e.message.includes('No cached KEK') || e.message.includes('unlock first')) {
      const pwd = prompt('Please enter your password to decrypt entries:')
      if (pwd) {
        try {
          await unlock(pwd)
          return loadEntries()
        } catch (unlockErr: any) {
          errorMsg.value = `Failed to unlock: ${unlockErr.message}`
        }
      } else {
        errorMsg.value = 'Password is required to decrypt entries'
      }
    } else {
      errorMsg.value = e.message || String(e)
    }
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