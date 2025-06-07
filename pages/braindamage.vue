<template>
  <ClientOnly>
  <div class="min-h-screen p-6 space-y-8">
    <h1 class="text-2xl font-bold">Crypto Session Debug</h1>

    <div class="rounded-lg bg-gray-50 p-4 shadow dark:bg-zinc-800">
      <h2 class="mb-2 text-lg font-semibold">Key status</h2>
      <ul class="space-y-1 text-sm text-gray-800 dark:text-gray-100">
        <li><strong>has KEK:</strong> {{ hasKek }}</li>
        <li><strong>has DEK:</strong> {{ hasDek }}</li>
        <li v-if="kekHex"><strong>KEK fingerprint:</strong> {{ kekHex }}</li>
        <li v-if="dekHex"><strong>DEK fingerprint:</strong> {{ dekHex }}</li>
      </ul>
      <button
        class="mt-4 rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50"
        :disabled="loading"
        @click="exportKeys"
      >
        Refresh keys
      </button>
    </div>

    <div v-if="entries.length" class="space-y-4">
      <h2 class="text-lg font-semibold">Decrypted entries (latest first)</h2>
      <ul>
        <li
          v-for="e in entries"
          :key="e.id"
          class="mb-4 rounded-lg bg-white p-4 shadow dark:bg-zinc-800"
        >
          <h3 class="mb-2 font-medium">Entry #{{ e.id }}</h3>
          <pre class="whitespace-pre-wrap break-all text-sm">{{ e.pretty }}</pre>
        </li>
      </ul>
    </div>

    <button
      v-if="hasDek && !entries.length"
      class="rounded bg-green-600 px-4 py-2 font-medium text-white disabled:opacity-50"
      :disabled="loadingEntries"
      @click="loadEntries"
    >
      {{ loadingEntries ? 'Decrypting…' : 'Load & Decrypt Entries' }}
    </button>

    <p v-if="error" class="text-red-600 dark:text-red-400">{{ error }}</p>
  </div>
</ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSupabaseClient } from '#imports'
import { useDek } from '~/composables/useDek'

const sb = useSupabaseClient()
const { dek, kek, unlocked, quickUnlock, open: openRow } = useDek()

const loading = ref(true)
const loadingEntries = ref(false)
const kekHex = ref<string | null>(null)
const dekHex = ref<string | null>(null)
const entries = ref<{ id: number; pretty: string }[]>([])
const error = ref('')

const hasKek = computed(() => !!kek.value)
const hasDek = computed(() => unlocked.value)

function bufToHex(buf: ArrayBuffer, bytes = 8) {
  return Array.from(new Uint8Array(buf).slice(0, bytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function exportKeyHex(key: CryptoKey) {
  const raw = await crypto.subtle.exportKey('raw', key)
  return bufToHex(raw)
}

async function exportKeys() {
  loading.value = true
  kekHex.value = dekHex.value = null
  try {
    if (!dek.value && kek.value) {
      await quickUnlock().catch(err => console.warn('[DBG] quickUnlock failed:', err))
    }
    if (kek.value) kekHex.value = await exportKeyHex(kek.value)
    if (dek.value) dekHex.value = await exportKeyHex(dek.value)
  } finally {
    loading.value = false
  }
}

interface Row { id: number; iv: string; data: string }

async function loadEntries() {
  if (!dek.value) return
  loadingEntries.value = true
  error.value = ''
  try {
    const { data, error: dbErr } = await sb
      .from('mood_entries')
      .select('id, iv, data')
      .order('id', { ascending: false })
      .limit(20)
    if (dbErr) throw dbErr
    const raw = data as Row[]
    const ok: { id: number; pretty: string }[] = []
    const bad: number[] = []
    for (const r of raw) {
      try {
        const payload = await openRow<any>({ enc_iv: r.iv, enc_blob: r.data })
        ok.push({ id: r.id, pretty: typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2) })
      } catch {
        bad.push(r.id)
      }
    }
    entries.value = ok
    if (bad.length) error.value = `Failed rows: ${bad.join(', ')}`
  } catch (e: any) {
    error.value = e.message ?? 'Unknown error'
  } finally {
    loadingEntries.value = false
  }
}

onMounted(exportKeys)
</script>
