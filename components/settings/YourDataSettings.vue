<template>
  <div class="space-y-8">
    <div class="bg-[var(--secondary)] p-3 sm:p-4 rounded-lg">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="mb-2 sm:mb-0">
          <h3 class="text-lg font-semibold text-[var(--fg)]">Local LLM only</h3>
          <p class="text-sm text-[var(--muted)] mt-1">
            Use only AI available on your device, no data gets sent to servers, performance may degrade.
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

    <div class="bg-[var(--secondary)] p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
      <div class="mb-3 sm:mb-0">
        <h3 class="text-lg font-semibold text-[var(--fg)]">Export data</h3>
        <p class="text-sm text-[var(--muted)]">Download your account data</p>
      </div>
      <button
        @click="handleExportData"
        class="px-4 py-2 rounded text-[var(--fg)] bg-[var(--primary)] hover:bg-[var(--accent)] transition w-full sm:w-auto"
      >
        Export data
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDiaryEntries } from '~/composables/useDiaryEntries';
import { useMoodEntries } from '~/composables/useMoodEntries';

const { finalizedEntries: diaryEntries, fetchFinalizedDiaryEntries } = useDiaryEntries();
const { finalizedEntries: moodEntries, fetchFinalizedMoodEntries } = useMoodEntries();

const localLLM = ref(true);

async function handleExportData() {
  try {
    await fetchFinalizedDiaryEntries();
    await fetchFinalizedMoodEntries();

    const data = {
      diaryEntries: diaryEntries.value,
      moodEntries: moodEntries.value
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'aurora-data.json';
    link.click();
    URL.revokeObjectURL(url);
  } catch (err: any) {
    alert(err?.statusMessage || err.message || 'Failed to export data');
  }
}
</script>
