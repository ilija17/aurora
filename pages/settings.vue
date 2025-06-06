<template>
  <div class="bg-[var(--bg)] min-h-screen flex flex-col lg:flex-row justify-start lg:justify-center px-4 py-6 sm:px-6 lg:px-8 sm:py-8 lg:py-12 gap-4 sm:gap-6 lg:gap-8">
    <!-- Desktop Sidebar -->
    <aside class="hidden lg:block w-64 bg-[var(--secondary)] rounded-2xl shadow-lg p-4 h-fit">
      <h2 class="text-xl text-[var(--fg)] mb-4 font-semibold">Settings</h2>
      <nav class="space-y-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="currentTab = tab.key"
          :class="[
            'block px-4 py-2 rounded w-full text-left transition text-base',
            'text-[var(--fg)] hover:text-[var(--accent)]',
            { active: currentTab === tab.key }
          ]"
        >
          {{ tab.label }}
        </button>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="w-full lg:flex-1 lg:max-w-4xl">
      <div class="rounded-2xl bg-[var(--secondary)] shadow-2xl p-4 sm:p-6 lg:p-8 relative">
        <!-- Mobile Dropdown -->
        <div class="lg:hidden absolute top-4 right-4 z-10">
          <div class="relative">
            <div
              @click="showMobileDropdown = !showMobileDropdown"
              class="flex items-center justify-center p-2 bg-transparent text-white rounded-lg hover:bg-[var(--highlighted)] transition touch-manipulation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-menu-2">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M4 6l16 0" />
                <path d="M4 12l16 0" />
                <path d="M4 18l16 0" />
              </svg>
            </div>
            
            <!-- Dropdown Menu -->
            <div
              v-if="showMobileDropdown"
              class="absolute top-full right-0 mt-2 w-48 bg-[var(--secondary)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden"
            >
              <div
                v-for="tab in tabs"
                :key="tab.key"
                @click="selectTab(tab.key)"
                :class="[
                  'block w-full px-4 py-3 text-left text-sm transition',
                  'text-[var(--fg)] hover:bg-[var(--highlighted)]',
                  {'bg-[var(--primary)] hover:bg-[var(--primary)] text-white' : currentTab === tab.key }
                ]"
              >
                {{ tab.label }}
          </div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="text-[var(--fg)] pt-3 lg:pt-0">
          <component :is="currentComponent" />
        </div>
      </div>
    </main>

    <!-- Mobile Dropdown Overlay -->
    <div
      v-if="showMobileDropdown"
      @click="showMobileDropdown = false"
      class="lg:hidden fixed inset-0 z-0"
    ></div>
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
const showMobileDropdown = ref(false);

const currentComponent = computed(() => {
  return tabs.find(t => t.key === currentTab.value)?.component || null;
});

const currentTabLabel = computed(() => {
  return tabs.find(t => t.key === currentTab.value)?.label || '';
});

const selectTab = (tabKey: string) => {
  currentTab.value = tabKey;
  showMobileDropdown.value = false;
};
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