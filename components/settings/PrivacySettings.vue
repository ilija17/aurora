<template>
  <div class="space-y-8">

    <!-- change password -->

    <div class="flex justify-between items-center">
      <div class="bg-[var(--secondary)] p-4 rounded-lg flex-col w-2/3">
        <div>
          <h3 class="text-lg font-semibold text-[var(--fg)]">Change password</h3>
          <p class="text-sm text-[var(--muted)]">Send a password reset link to your e-mail</p>
        </div>
      </div>
      <button
        class="m-4 p-2 rounded transition text-white disabled:opacity-50"
        @click="handleChangePassword"
      >
        Change
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
</div>
</template>

<script setup lang="ts">
  const { siteUrl } = useRuntimeConfig().public

  const config = useRuntimeConfig()
  const supabase = useSupabaseClient();
  const user     = useSupabaseUser();

  async function handleChangePassword(){
    if (!user.value?.email) {
      alert("No email found. Are you logged in?");
      return;
    }

    const redirectTo = `${config.public.siteUrl}/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(user.value.email, {
      redirectTo: `${siteUrl}/reset-password`,
    })

    if (error) {
      alert("Failed to send password reset email.");
      return;
    }

    alert("Password reset email sent.");
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