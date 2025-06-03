<template>
  <div class="min-h-screen p-6 space-y-6">
    <h1 class="text-2xl font-bold">Crypto Session Debug</h1>

    <div class="rounded-lg bg-gray-50 p-4 shadow dark:bg-zinc-800">
      <h2 class="mb-2 text-lg font-semibold">Key status</h2>
      <ul class="space-y-1 text-sm text-gray-800 dark:text-gray-100">
        <li><strong>has KEK:</strong> {{ hasKek }}</li>
        <li><strong>has DEK:</strong> {{ hasDek }}</li>
        <li v-if="kekHex"><strong>KEK fingerprint:</strong> {{ kekHex }}</li>
        <li v-if="dekHex"><strong>DEK fingerprint:</strong> {{ dekHex }}</li>
      </ul>
    </div>

    <button
      class="rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50"
      :disabled="loading"
      @click="exportKeys"
    >
      Refresh
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useDek } from '~/composables/useDek'

const { dek, unlocked, hasKek, quickUnlock } = useDek()

const loading = ref(true)
const kekHex  = ref<string | null>(null)
const dekHex  = ref<string | null>(null)

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
    if (!dek.value && hasKek.value) {
      try {
        await quickUnlock()
      } catch (err) {
        console.warn('[DBG] quickUnlock failed:', err)
      }
    }

    if (hasKek.value) {
      kekHex.value = await exportKeyHex(hasKek.value)
    }

    if (dek.value) {
      dekHex.value = await exportKeyHex(dek.value)
    }
  } finally {
    loading.value = false
  }
}

onMounted(exportKeys)
</script>
