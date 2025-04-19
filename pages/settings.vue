<template>
  <div class="bg-[var(--bg)] min-h-screen flex justify-center px-8 py-12 gap-8">
    <aside class="w-64 bg-[var(--secondary)] rounded-2xl shadow-lg p-4 h-fit">
      <h2 class="text-xl text-[var(--fg)] mb-4">Settings</h2>
      <nav class="space-y-2">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="currentTab = tab.key"
          :class="[
            'block px-4 py-2 rounded w-full text-left transition',
            'hover:text-[var(--accent)]',
            { active: currentTab === tab.key }
          ]"
        >
          {{ tab.label }}
        </button>
      </nav>
      
    </aside>

    <main class="flex-1 max-w-4xl">
      <div class="rounded-2xl bg-[var(--secondary)] shadow-2xl p-8">
          <div class="text-[var(--fg)]">
            <component :is="currentComponent" />
          </div>
      </div>
    </main>
  </div>
</template>


<script setup lang="ts">
import ProfileSettings from '../components/settings/ProfileSettings.vue';
import PrivacySettings from '../components/settings/PrivacySettings.vue';
import PasswordSettings from '../components/settings/PasswordSettings.vue';
import DataSettings from '../components/settings/YourDataSettings.vue';

const tabs = [
  { key: 'profile', label: 'Profile', component: ProfileSettings },
  { key: 'privacy', label: 'Privacy and safety', component: PrivacySettings },
  { key: 'password', label: 'Password', component: PasswordSettings },
  { key: 'data', label: 'Your Data', component: DataSettings },
];

const currentTab = ref('profile');

const currentComponent = computed(() => {
  return tabs.find(t => t.key === currentTab.value)?.component || null
});
</script>

<style scoped>
button {
  background-color: var(--secondary);
}

button.active {
  background-color: var(--primary);
}

button:hover {
  background-color: var(--accent);
}
</style>
