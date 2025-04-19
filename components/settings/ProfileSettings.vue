<template>
  <div class="space-y-8">
    <!-- Local LLM only toggle -->
    <div class="bg-[var(--secondary)] p-4 rounded-lg">
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
    <div class="bg-[var(--secondary)] p-4 rounded-lg flex justify-between items-center">
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
    <div class="bg-[var(--secondary)] p-4 rounded-lg flex justify-between items-center">
      <div>
        <h3 class="text-lg font-semibold text-[var(--fg)]">Delete account</h3>
        <p class="text-sm text-[var(--muted)]">Permanently delete your account and data</p>
      </div>
      <button @click="deleteAccountConfirmation" class="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700 transition">
        Delete account
      </button>
    </div>
  </div>

  <div
  v-if="showDeleteModal"
  class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
>
  <div class="bg-[var(--secondary)] p-6 rounded-xl shadow-lg w-[90%] max-w-md text-[var(--fg)]">
    <h2 class="text-xl font-bold mb-4">Are you sure?</h2>
    <p class="text-sm text-[var(--muted)] mb-4">
      This action will permanently delete your account and all associated data. This cannot be undone.
    </p>
    <p class="text-sm text-[var(--muted)] mb-2">
      Please type your username <span class="font-semibold text-[var(--fg)]">{{ user?.user_metadata?.username }}</span> to confirm.
    </p>

    <input
      v-model="usernameInput"
      type="text"
      placeholder="Enter your username"
      class="w-full p-2 mb-6 bg-[var(--border)] text-[var(--fg)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
    />

    <div class="flex justify-end gap-3">
      <button
        @click="showDeleteModal = false"
        class="px-4 py-2 rounded bg-[var(--border)] hover:bg-[var(--muted)] text-[var(--fg)] transition"
      >
        Cancel
      </button>
      <button
  @click="confirmDelete"
  :disabled="usernameInput !== user?.user_metadata?.username"
  class="px-4 py-2 rounded transition text-white disabled:opacity-50"
  :class="usernameInput === user?.user_metadata?.username
    ? 'bg-red-600 hover:bg-red-700 cursor-pointer'
    : 'bg-red-300 cursor-not-allowed pointer-events-none'
  "
>
  Yes, delete
</button>

    </div>
  </div>
</div>

</template>

<script setup lang="ts">
const localLLM = ref(true);
const showDeleteModal = ref(false);
const usernameInput = ref('');

const supabase = useSupabaseClient();
const user     = useSupabaseUser();

const deleteAccountConfirmation = async () => {
  usernameInput.value = '';
  showDeleteModal.value = true;
}

const confirmDelete = async () => {
  try {
    await $fetch('/api/delete-user-self', { method: 'POST' });
    await logout();
  } catch (err: any) {
    console.log(err);
    alert(err.statusMessage || err.message || 'Failed to delete account');
  }
}

const logout = async () => {
  await supabase.auth.signOut();
  navigateTo('/login');
}
</script>