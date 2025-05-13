<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center">
      <div class="bg-[var(--secondary)] p-4 rounded-lg flex-col w-2/3">
          <h3 class="text-lg font-semibold text-[var(--fg)] mb-3">Username</h3>
          <input
          v-model="username"
          type="text"
          :placeholder="user?.user_metadata?.username || 'Username'"
          class="w-1/1 p-2 mr-7 bg-[var(--border)] text-[var(--fg)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
      </div>
      <button
        class="m-4 p-2 rounded transition text-white disabled:opacity-50"
        @click="handleUpdateUsername"
      >
        Change
      </button>
    </div>

    <div class="flex justify-between items-center">
      <div class="bg-[var(--secondary)] p-4 rounded-lg flex-col w-2/3">
          <h3 class="text-lg font-semibold text-[var(--fg)] mb-3">E-mail</h3>
          <input
          v-model="email"
          type="text"
          :placeholder="user?.user_metadata?.email || 'E-mail'"
          class="w-1/1 p-2 mr-7 bg-[var(--border)] text-[var(--fg)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
      </div>
      <button
        class="m-4 p-2 rounded transition text-white disabled:opacity-50"
        @click="showConfirmPassModal = true"
      >
        Change
      </button>
    </div>
    <!-- confirm password modal -->
    <div
    v-if="showConfirmPassModal"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
  >
    <div class="bg-[var(--secondary)] p-6 rounded-xl shadow-lg w-[90%] max-w-md text-[var(--fg)]">
      <h2 class="text-xl font-bold mb-4">Please enter your current password.</h2>
      <p class="text-sm text-[var(--muted)] mb-4">
        Re-entering your password is necessary to protect your account from being stolen.
      </p>

      <input
        v-model="password"
        type="text"
        placeholder="Password"
        class="w-full p-2 mb-6 bg-[var(--border)] text-[var(--fg)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
      />

      <div class="flex justify-end gap-3">
        <button
          @click="showConfirmPassModal = false"
          class="px-4 py-2 rounded bg-[var(--border)] hover:bg-[var(--muted)] text-[var(--fg)] transition"
        >
          Cancel
        </button>
        <button
          @click="handleUpdateEmail"
          :disabled="password === ''"
          class="px-4 py-2 rounded transition text-white disabled:opacity-50"
        >
          Change e-mail
        </button>
      </div>
    </div>
  </div>


  </div>
  
</template>

<script setup lang="ts">
  const user     = useSupabaseUser();

  const email = ref('');
  const username = ref('');
  const password = ref('');

  const showConfirmPassModal = ref(false);

async function handleUpdateUsername() {
  const { data, error } = await useFetch<{ message: string }>('/api/user/update-username', {
    method: 'POST',
    body: { username: username },
  });

  if (error.value) {
    alert(error.value.data?.statusMessage || 'Something went wrong.');
    return;
  }
  alert(data.value?.message || 'Profile updated!');
}

async function handleUpdateEmail() {
  const { data, error } = await useFetch<{ message: string }>('/api/user/update-email', {
    method: 'POST',
    body: { 
      password: password,
      email: email,
    }
  })

  if (error.value) {
    alert(error.value.data?.statusMessage || 'Something went wrong.');
    return;
  }
  alert(data.value?.message || 'E-mail updated! Please confirm the new e-mail address.');
}

</script>