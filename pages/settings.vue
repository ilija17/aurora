<template>
  <div class="bg-[var(--bg)] min-h-screen flex px-8 py-12 gap-8">
    <!-- Sidebar -->
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
            currentTab === tab.key
              ? 'text-[var(--primary)]'
              : 'text-[var(--secondary)]'
          ]"
        >
          {{ tab.label }}
        </button>
      </nav>
    </aside>

    <!-- Main Content Panel -->
    <main class="flex-1 max-w-4xl">
      <div class="rounded-2xl bg-[var(--secondary)] shadow-2xl p-8">
        <ClientOnly>
          <div class="text-[var(--fg)]">
            <component :is="currentComponent" />
          </div>
        </ClientOnly>
      </div>
    </main>
  </div>
</template>


<script>
import ProfileSettings from '../components/settings/ProfileSettings.vue';
import PrivacySettings from '../components/settings/PrivacySettings.vue';
import PasswordSettings from '../components/settings/PasswordSettings.vue';
import DataSettings from '../components/settings/YourDataSettings.vue';

export default {
  middleware: 'auth',
  components: {
    ProfileSettings,
    PrivacySettings,
    PasswordSettings,
    DataSettings,
    ClientOnly: {
      functional: true,
      render: (h, ctx) => h('transition', ctx.data, ctx.children)
    }
  },
  data() {
    return {
      tabs: [
        { key: 'profile', label: 'Profile', component: 'ProfileSettings' },
        { key: 'privacy', label: 'Privacy and safety', component: 'PrivacySettings' },
        { key: 'password', label: 'Password', component: 'PasswordSettings' },
        { key: 'data', label: 'Your Data', component: 'DataSettings' },
      ],
      currentTab: 'privacy',
    };
  },
  computed: {
    currentComponent() {
      const foundTab = this.tabs.find(t => t.key === this.currentTab);
      return foundTab ? foundTab.component : null;
    },
  },
};
</script>
