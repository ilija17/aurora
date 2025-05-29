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
    <div v-else>Loading…</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'
import { useDek } from '~/composables/useDek'

interface RawRow {
  id:   number
  iv:   string
  data: string
}

const supabase = useSupabaseClient()
const { unlock, open, unlocked } = useDek()

const decrypted = ref<Array<{ id: number; payload: any }>>([])
const errorMsg  = ref('')

onMounted(async () => {
  try {
    await unlock()
    if (!unlocked.value) throw new Error('Could not unlock encryption key')

    const { data, error } = await supabase
      .from<RawRow>('mood_entries')
      .select('id, iv, data')

    if (error) throw new Error(error.message)
    if (!data || data.length === 0) {
      decrypted.value = []
      return
    }

    decrypted.value = await Promise.all(
      data.map(async row => {
        const payload = await open({
          enc_iv:   row.iv,
          enc_blob: row.data
        })
        return { id: row.id, payload }
      })
    )
  } catch (e: any) {
    errorMsg.value = e.message || String(e)
    console.error(e)
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
