<script setup lang="ts">
import { ref, onMounted } from 'vue'

const sb                = useSupabaseClient()
const user              = useSupabaseUser()
const { unlock, open }  = useDek()

const secrets   = ref<string[]>([])
const busy      = ref(false)
const errorMsg  = ref('')

async function loadAll () {
  if (!user.value) return
  busy.value   = true
  errorMsg.value = ''

  try {
    await unlock()

    const { data, error } = await sb
      .from('secrets')
      .select('*')
      .eq('user_id', user.value.id)
      .order('id')
    if (error) throw error

    const plain = await Promise.all(
      data.map(row => open<{ msg: string }>(row))
    )
    secrets.value = plain.map(p => p.msg)
  } catch (e: any) {
    errorMsg.value = e.message
  } finally {
    busy.value = false
  }
}

onMounted(loadAll)
</script>

<template>
  <div class="max-w-lg mx-auto pt-10 space-y-4">
    <h1 class="text-xl font-semibold">🔐 All My Secrets</h1>

    <button
      @click="loadAll"
      :disabled="busy"
      class="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
    >
      Reload
    </button>

    <ul class="list-disc pl-5 space-y-1">
      <li v-for="(s, i) in secrets" :key="i" class="break-words font-mono">
        {{ s }}
      </li>
    </ul>

    <p v-if="errorMsg" class="text-red-600">{{ errorMsg }}</p>
    <p v-if="busy" class="text-gray-500">Loading…</p>
  </div>
</template>
