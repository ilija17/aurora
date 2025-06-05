<template>
  <div class="bg-[var(--bg)] min-h-screen flex flex-col lg:flex-row justify-start lg:justify-center px-4 py-6 sm:px-6 lg:px-8 sm:py-8 lg:py-12 gap-4 sm:gap-6 lg:gap-8">
    <aside class="w-full lg:w-64 bg-[var(--secondary)] rounded-2xl shadow-lg p-3 sm:p-4 h-fit mb-6 lg:mb-0">
      <h2 class="text-xl text-[var(--fg)] mb-4 font-semibold">Settings</h2>
      <nav class="space-y-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="currentTab = tab.key"
          :class="[
            'block px-3 sm:px-4 py-2 rounded w-full text-left transition text-sm sm:text-base',
            'text-[var(--fg)] hover:text-[var(--accent)]',
            { active: currentTab === tab.key }
          ]"
        >
          {{ tab.label }}
        </button>
      </nav>
    </aside>

    <main class="w-full lg:flex-1 lg:max-w-4xl">
      <div class="rounded-2xl bg-[var(--secondary)] shadow-2xl p-4 sm:p-6 lg:p-8">
          <div class="text-[var(--fg)]">
            <component :is="currentComponent" />
          </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ProfileSettings from '../components/settings/ProfileSettings.vue'; 
import PrivacySettings from '../components/settings/PrivacySettings.vue';
import DataSettings from '../components/settings/YourDataSettings.vue'; 

const tabs = [
  { key: 'profile', label: 'Profile', component: ProfileSettings },
  { key: 'privacy', label: 'Privacy and safety', component: PrivacySettings },
  { key: 'data', label: 'Your Data', component: DataSettings }, 
];

const currentTab = ref('profile');

const currentComponent = computed(() => {
  return tabs.find(t => t.key === currentTab.value)?.component || null;
});
</script>

<style scoped>
nav > button {
  background-color: transparent;
  color: var(--fg);
}

nav > button.active {
  background-color: var(--primary);
  color: white;
}

nav > button:not(.active):hover {
  background-color: var(--highlighted);
  color: var(--accent);
}
</style>