<template>
  <div class="space-y-8">


    <!-- Change password -->
    <div class="bg-[var(--secondary)] p-4 rounded-lg flex justify-between items-center">
      <div>
        <h3 class="text-lg font-semibold text-[var(--fg)]">Change your password</h3>
        <p class="text-sm text-[var(--muted)]">This will change the password you log in with</p>
      </div>
        <button
        @click="changePass"
        class="text-nowrap w-auto px-4 py-2 rounded text-[var(--fg)] bg-[var(--primary)] hover:bg-[var(--accent)] transition"
        >
          Change
        </button>
    </div>

    <div
    v-if="showChangePassModal"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
    <div class="bg-[var(--secondary)] p-6 rounded-xl shadow-lg w-[90%] max-w-md text-[var(--fg)]">
      <h2 class="text-xl font-bold mb-4">Are you sure?</h2>
      <p class="text-sm text-[var(--muted)] mb-4">
        This action will change your account's password. Be careful not to forget it.
      </p>
      <p class="text-sm text-[var(--muted)] mb-2">
        Please type your current password to confirm.
      </p>

      <input
        v-model="currentPassInput"
        type="text"
        placeholder="Enter current password"
        class="w-full p-2 mb-6 bg-[var(--border)] text-[var(--fg)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
      />

      <div class="flex justify-end gap-3">
        <button
          @click="showChangePassModal = false"
          class="px-4 py-2 rounded bg-[var(--border)] hover:bg-[var(--muted)] text-[var(--fg)] transition"
        >
          Cancel
        </button>
        <button
          @click="confirmChangePass"
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
    <!-- End change password -->

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

  <!-- End delete account -->
</div>
</template>

<script setup lang="ts">
  const supabase = useSupabaseClient();
  const user     = useSupabaseUser();

  // logika za potvrdu brisanja accounta
  const showDeleteModal = ref(false);
  const usernameInput = ref('');

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

  //logika za mjenjanje lozinke
  const showChangePassModal = ref(false);
  const currentPassInput = ref('');
  const newPassInput = ref('');


  
</script>