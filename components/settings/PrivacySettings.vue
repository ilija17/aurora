<template>
  <div class="space-y-8">

    <div class="flex flex-col sm:flex-row justify-between sm:items-center p-3 sm:p-0">
      <div class="bg-[var(--secondary)] p-3 sm:p-4 rounded-lg flex-col w-full sm:w-2/3 mb-4 sm:mb-0">
        <div>
          <h3 class="text-lg font-semibold text-[var(--fg)]">Change password</h3>
          <p class="text-sm text-[var(--muted)]">Update your login password and re-encrypt your data</p>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:m-4 w-full sm:w-auto">
        <input
          v-model="newPassword"
          type="password"
          placeholder="New password"
          class="p-2 rounded bg-[var(--border)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] w-full sm:w-auto"
        />
        <button
          class="p-2 rounded transition text-white disabled:opacity-50 bg-[var(--primary)] hover:bg-[var(--accent)] w-full sm:w-auto"
          @click="handleChangePassword"
          :disabled="!newPassword"
        >
          Change
        </button>
      </div>
    </div>

    <div class="bg-[var(--secondary)] p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
        <div class="mb-3 sm:mb-0">
          <h3 class="text-lg font-semibold text-[var(--fg)]">Delete account</h3>
          <p class="text-sm text-[var(--muted)]">Permanently delete your account and data</p>
        </div>
        <button @click="deleteAccountConfirmation" class="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700 transition w-full sm:w-auto">
          Delete account
        </button>
      </div>

    <div
    v-if="showDeleteModal"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-[var(--secondary)] p-4 sm:p-6 rounded-xl shadow-lg w-[90%] max-w-md text-[var(--fg)]">
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

      <div class="flex flex-col sm:flex-row justify-end gap-3">
        <button
          @click="showDeleteModal = false"
          class="px-4 py-2 rounded bg-[var(--border)] hover:bg-[var(--muted)] text-[var(--fg)] transition order-2 sm:order-1"
        >
          Cancel
        </button>
        <button
          @click="confirmDelete"
          :disabled="usernameInput !== user?.user_metadata?.username"
          class="px-4 py-2 rounded transition text-white disabled:opacity-50 order-1 sm:order-2"
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
</div>
</template>

<script setup lang="ts">
  const { siteUrl } = useRuntimeConfig().public

  const config = useRuntimeConfig()
  const supabase = useSupabaseClient();
  const user     = useSupabaseUser();
  const { updateDekPassword } = useDek();
  const newPassword = ref('');

  async function handleChangePassword(){
    if (!newPassword.value) {
      alert('Please enter a new password');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword.value })

    if (error) {
      alert(error.message);
      return;
    }

    try {
      await updateDekPassword(newPassword.value)
      alert('Password updated and data re-encrypted');
      newPassword.value = ''
    } catch (e: any) {
      alert('Password changed but failed to re-encrypt data: ' + (e.message || e))
    }
  }

  // logika za potvrdu brisanja accounta
  const showDeleteModal = ref(false);
  const usernameInput = ref('');

  async function deleteAccountConfirmation(){
    usernameInput.value = '';
    showDeleteModal.value = true;
  }

  async function confirmDelete(){
    try {
      await $fetch('/api/user/delete-user-self', { method: 'POST' });
      await logout();
    } catch (err: any) {
      alert(err.statusMessage || err.message || 'Failed to delete account');
    }
  }

  async function logout(){
    await supabase.auth.signOut();
    navigateTo('/login');
  }
</script>