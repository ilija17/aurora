<template>
  <section class="min-h-screen flex items-center justify-center px-4">
    <div
      class="max-w-md w-full space-y-4 bg-[var(--secondary)] p-6 sm:p-8 rounded-3xl shadow-2xl"
    >
      <h2 class="text-2xl font-bold text-center mb-4">Unlock Encryption</h2>
      <form @submit.prevent="handleUnlock" class="space-y-4">
        <FormInput
          id="password"
          label="Password"
          type="password"
          v-model="password"
          placeholder="Enter your password"
          required
        />
        <button
          type="submit"
          :disabled="submitting || !password"
          class="btn w-full disabled:opacity-50"
        >
          Unlock
        </button>
      </form>
      <p v-if="errorMsg" class="mt-2 text-red-600">{{ errorMsg }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useDek } from '~/composables/useDek';

definePageMeta({ requiresAuth: true });

const router = useRouter();
const route = useRoute();
const { unlock } = useDek();

const password = ref('');
const errorMsg = ref('');
const submitting = ref(false);

async function handleUnlock() {
  errorMsg.value = '';
  submitting.value = true;
  try {
    await unlock(password.value);
    const redirectTo = route.query.redirect as string | undefined;
    await router.push(redirectTo ?? '/welcome');
  } catch (err: any) {
    errorMsg.value = err.message ?? 'Failed to unlock';
  } finally {
    submitting.value = false;
    password.value = '';
  }
}
</script>
