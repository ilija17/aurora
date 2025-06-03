<template>
  <div class="min-h-screen p-4">
    <h1 class="text-2xl font-bold mb-6">Decrypted Mood Entries</h1>

    <!-- error banner -->
    <div
      v-if="error"
      class="mb-4 rounded-md bg-red-100 p-3 text-red-700 dark:bg-red-900 dark:text-red-200"
    >
      {{ error }}
    </div>

    <!-- loading indicator -->
    <div v-if="loading" class="text-gray-500 dark:text-gray-400">Loading…</div>

    <!-- list of plaintext entries -->
    <ul v-else>
      <li
        v-for="e in entries"
        :key="e.id"
        class="mb-4 rounded-lg bg-white p-4 shadow dark:bg-zinc-800"
      >
        <h2 class="mb-2 font-semibold">Entry #{{ e.id }}</h2>
        <pre class="whitespace-pre-wrap break-all">{{ e.pretty }}</pre>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'
import { useDek } from '~/composables/useDek'

/** DB row reflects exact column names: id, iv, data */
interface RawRow {
  id: number
  iv: string
  data: string
}

interface PlainRow {
  id: number
  data: any
  pretty: string
}

const sb = useSupabaseClient()
const {
  unlocked,
  unlock,
  quickUnlock,
  open: openRow
} = useDek()

const entries = ref<PlainRow[]>([])
const loading = ref(true)
const error   = ref('')

async function ensureDek() {
  if (unlocked.value) return

  try {
    await quickUnlock()
  } catch (err: any) {
    if (err?.message?.includes('No cached KEK')) {
      const pwd = prompt('Enter password to decrypt your entries:')
      if (!pwd) throw new Error('Password is required to decrypt entries')
      await unlock(pwd)
    } else {
      throw err
    }
  }

  if (!unlocked.value) throw new Error('Failed to unlock DEK')
}

async function fetchEncrypted(): Promise<RawRow[]> {
  const { data, error } = await sb
    .from('mood_entries')
    .select('id, iv, data')
    .order('id', { ascending: false })

  if (error) throw error
  return data as RawRow[]
}

onMounted(async () => {
  try {
    await ensureDek()

    const rows = await fetchEncrypted()

    entries.value = await Promise.all(
      rows.map(async r => {
        // adapt to useDek.open expected shape { enc_iv, enc_blob }
        const payload = await openRow<any>({
          enc_iv: r.iv,
          enc_blob: r.data
        })

        return {
          id: r.id,
          data: payload,
          pretty: typeof payload === 'string'
            ? payload
            : JSON.stringify(payload, null, 2)
        }
      })
    )
  } catch (e: any) {
    console.error('[Decrypt] failed', e)
    error.value = e.message ?? 'Unknown error'
  } finally {
    loading.value = false
  }
})
</script>
