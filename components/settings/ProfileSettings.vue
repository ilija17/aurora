<template>
  <div class="space-y-8">
    <div class="bg-[var(--secondary)] p-4 rounded-lg flex-col ">
        <h3 class="text-lg font-semibold text-[var(--fg)] mb-3">Username</h3>
        <input
        v-model="usernameInput"
        type="text"
        :placeholder="user?.user_metadata?.username || 'Username'"
        class="w-2/3 p-2 mr-7 bg-[var(--border)] text-[var(--fg)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
      />
    </div>

    <div class="bg-[var(--secondary)] p-4 rounded-lg flex-col ">
        <h3 class="text-lg font-semibold text-[var(--fg)] mb-3">E-mail</h3>
        <input
        v-model="emailInput"
        type="text"
        :placeholder="user?.user_metadata?.email || 'E-mail'"
        class="w-2/3 p-2 mr-7 bg-[var(--border)] text-[var(--fg)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
      />
    </div>

    <button
          class="m-4 p-2 rounded transition text-white disabled:opacity-50"
        >
          Save
        </button>

  </div>
  
</template>

<script setup lang="ts">
  const supabase = useSupabaseClient();
  const user     = useSupabaseUser();
  const usernameInput = ref("");
  const emailInput = ref("");
</script>