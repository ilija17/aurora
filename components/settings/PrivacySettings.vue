<template>
  <div class="space-y-8">
    <!-- Local LLM only toggle -->
    <div class="bg-[var(--tertiary)] p-4 rounded-lg">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-[var(--fg)]">Local LLM only</h3>
          <p class="text-sm text-[var(--muted)] mt-1">
            Use only AI available on your device, no data gets sent to servers, performance may degrade
          </p>
        </div>
        <label class="inline-flex items-center cursor-pointer">
          <input type="checkbox" v-model="localLLM" class="sr-only peer" />
          <div
            class="w-11 h-6 bg-[var(--border)] rounded-full peer peer-checked:bg-[var(--primary)] transition-all relative"
          >
            <div
              class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform"
              :class="{ 'translate-x-full': localLLM }"
            />
          </div>
        </label>
      </div>
    </div>

    <!-- Export data -->
    <div class="bg-[var(--tertiary)] p-4 rounded-lg flex justify-between items-center">
      <div>
        <h3 class="text-lg font-semibold text-[var(--fg)]">Export data</h3>
        <p class="text-sm text-[var(--muted)]">Download your account data</p>
      </div>
      <button
        class="px-4 py-2 rounded text-[var(--fg)] bg-[var(--primary)] hover:bg-[var(--accent)] transition"
      >
        Export data
      </button>
    </div>

    <!-- Delete account -->
    <div class="bg-[var(--tertiary)] p-4 rounded-lg flex justify-between items-center">
      <div>
        <h3 class="text-lg font-semibold text-[var(--fg)]">Delete account</h3>
        <p class="text-sm text-[var(--muted)]">Permanently delete your account and data</p>
      </div>
      <button class="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700 transition">
        Delete account
      </button>
    </div>
  </div>
</template>

<script setup>
const localLLM = ref(true)
</script>
