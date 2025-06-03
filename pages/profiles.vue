<!-- pages/secrets.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const sb             = useSupabaseClient()
const user           = useSupabaseUser()
const { unlock, seal, open } = useDek()

const text       = ref('')
const latestMsg  = ref('')
const busy       = ref(false)
const errorMsg   = ref('')

async function saveSecret () {
  if (!text.value.trim()) return
  busy.value = true
  errorMsg.value = ''
  try {
    await unlock()
    const enc = await seal({ msg: text.value }) 
    await sb.from('secrets').insert({
      user_id: user.value!.id,
      ...enc
    })
    text.value = ''
    await readLatest()
  } catch (e: any) {
    errorMsg.value = e.message
  } finally {
    busy.value = false
  }
}

async function readLatest () {
  busy.value = true
  errorMsg.value = ''
  try {
    await unlock()
    const { data } = await sb
      .from('secrets')
      .select('*')
      .eq('user_id', user.value!.id)
      .order('id', { ascending: false })
      .limit(1)

    latestMsg.value = data?.length
      ? (await open<{ msg: string }>(data[0])).msg
      : '(none saved yet)'
  } catch (e: any) {
    errorMsg.value = e.message
  } finally {
    busy.value = false
  }
}

if (user.value) readLatest()
</script>

<template>
  <div class="container max-w-lg pt-10 space-y-4">
    <h1 class="text-xl font-semibold">🔐 End-to-End Encrypted Secrets</h1>

    <div class="flex gap-2">
      <input
        v-model="text"
        placeholder="type a secret"
        class="flex-1 border rounded px-3 py-2"
      />
      <button
        @click="saveSecret"
        :disabled="busy"
        class="btn-primary disabled:opacity-50"
      >
        Save
      </button>
    </div>

    <div class="border p-4 rounded bg-gray-50">
      <p class="text-sm text-gray-500 mb-1">Most-recent secret:</p>
      <p class="font-mono break-words">{{ latestMsg }}</p>
    </div>

    <p v-if="errorMsg" class="text-red-600">{{ errorMsg }}</p>
  </div>
</template>
