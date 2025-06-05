<template>
  <div class="space-y-8">
    <div class="flex flex-col sm:flex-row justify-between sm:items-center p-3 sm:p-0">
      <div class="bg-[var(--secondary)] p-3 sm:p-4 rounded-lg flex-col w-full sm:w-2/3 mb-4 sm:mb-0">
          <h3 class="text-lg font-semibold text-[var(--fg)] mb-3">Username</h3>
          <input
          v-model="username"
          type="text"
          :placeholder="user?.user_metadata?.username || 'Username'"
          class="w-full p-2 bg-[var(--border)] text-[var(--fg)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
      </div>
      <button
        class="m-0 sm:m-4 p-2 rounded transition text-white disabled:opacity-50 bg-[var(--primary)] hover:bg-[var(--accent)] w-full sm:w-auto"
        @click="handleUpdateUsername"
        :disabled="!username"
      >
        Change
      </button>
    </div>

    <div class="flex flex-col sm:flex-row justify-between sm:items-center p-3 sm:p-0">
      <div class="bg-[var(--secondary)] p-3 sm:p-4 rounded-lg flex-col w-full sm:w-2/3 mb-4 sm:mb-0">
          <h3 class="text-lg font-semibold text-[var(--fg)] mb-3">E-mail</h3>
          <input
          v-model="email"
          type="text"
          :placeholder="user?.email || 'E-mail'" 
          class="w-full p-2 bg-[var(--border)] text-[var(--fg)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
      </div>
      <button
        class="m-0 sm:m-4 p-2 rounded transition text-white disabled:opacity-50 bg-[var(--primary)] hover:bg-[var(--accent)] w-full sm:w-auto"
        @click="showConfirmPassModal = true"
        :disabled="!email"
      >
        Change
      </button>
    </div>

    <div
    v-if="showConfirmPassModal"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-[var(--secondary)] p-4 sm:p-6 rounded-xl shadow-lg w-[90%] max-w-md text-[var(--fg)]">
      <h2 class="text-xl font-bold mb-4">Please enter your current password</h2>
      <p class="text-sm text-[var(--muted)] mb-4">
        Re-entering your password is necessary to protect your account.
      </p>

      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="w-full p-2 mb-6 bg-[var(--border)] text-[var(--fg)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
      />

      <div class="flex flex-col sm:flex-row justify-end gap-3">
        <button
          @click="showConfirmPassModal = false"
          class="px-4 py-2 rounded bg-[var(--border)] hover:bg-[var(--muted)] text-[var(--fg)] transition order-2 sm:order-1"
        >
          Cancel
        </button>
        <button
          @click="handleUpdateEmail"
          :disabled="password === ''"
          class="px-4 py-2 rounded transition text-white disabled:opacity-50 bg-[var(--primary)] hover:bg-[var(--accent)] order-1 sm:order-2"
        >
          Change e-mail
        </button>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
  const user = useSupabaseUser();
  const supabase = useSupabaseClient(); 

  const email = ref(user.value?.email || ''); 
  const username = ref(user.value?.user_metadata?.username || '');
  const password = ref(''); 

  const showConfirmPassModal = ref(false);

async function handleUpdateUsername() {
  if (!username.value || username.value === user.value?.user_metadata?.username) {
    alert('Please enter a new username.');
    return;
  }

  const { data, error } = await useFetch<{ message: string }>('/api/user/update-username', {
     method: 'POST',
     body: { username: username.value },
   });

   if (error.value) {
     alert(error.value.data?.message || 'Something went wrong.');
     return;
  }
  alert('Username updated!');

}


async function handleUpdateEmail() {
  if (!email.value || !password.value) {
    alert('Please enter your new email and current password.');
    return;
  }
  showConfirmPassModal.value = false;

  const { data, error } = await useFetch<{ message: string }>('/api/user/update-email', {
    method: 'POST',
    body: { 
      password: password.value,
      email: email.value,
    }
  });

  password.value = ''; 

  if (error.value) {
    alert(error.value.data?.message || error.value.message || 'Something went wrong.');
    return;
  }
  alert(data.value?.message || 'E-mail update process initiated! Please check your inbox to confirm the new e-mail address.');
}
</script>